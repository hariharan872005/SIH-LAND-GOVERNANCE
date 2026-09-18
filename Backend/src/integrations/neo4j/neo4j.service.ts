import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

export interface Neo4jOwnershipChain {
  currentOwner: any;
  previousOwners: any[];
  totalTransfers: number;
  transactions: any[];
  nodes: any[];
  relationships: any[];
}

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private driver: Driver;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('NEO4J_URI', 'bolt://localhost:7687');
    const username = this.configService.get<string>('NEO4J_USERNAME', 'neo4j');
    const password = this.configService.get<string>('NEO4J_PASSWORD', 'neo4j_secret_pass');

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
        maxConnectionLifetime: 3 * 60 * 60 * 1000,
        maxConnectionPoolSize: 50,
      });

      const serverInfo = await this.driver.getServerInfo();
      this.isConnected = true;
      this.logger.log(`Connected to Neo4j Graph DB: ${serverInfo.address} (${serverInfo.agent})`);
      await this.initializeGraphSchema();
    } catch (err) {
      this.logger.warn(`Neo4j connection deferred (will retry on demand): ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
    }
  }

  private async initializeGraphSchema() {
    const session = this.getSession();
    try {
      // Create constraints for Person, Land, Transaction
      await session.run(`CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE`);
      await session.run(`CREATE CONSTRAINT land_id_unique IF NOT EXISTS FOR (l:Land) REQUIRE l.landId IS UNIQUE`);
      await session.run(`CREATE CONSTRAINT tx_id_unique IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE`);
      this.logger.log('Neo4j unique constraints verified.');
    } catch (err) {
      this.logger.debug(`Schema initialization note: ${err.message}`);
    } finally {
      await session.close();
    }
  }

  getSession(): Session {
    if (!this.driver) {
      const uri = this.configService.get<string>('NEO4J_URI', 'bolt://localhost:7687');
      const username = this.configService.get<string>('NEO4J_USERNAME', 'neo4j');
      const password = this.configService.get<string>('NEO4J_PASSWORD', 'neo4j_secret_pass');
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    }
    return this.driver.session();
  }

  // 1. Create or Match Person Node
  async createOrUpdatePerson(person: {
    id: string;
    name: string;
    panOrAadhaarHash: string;
    ownershipType?: string;
  }) {
    const session = this.getSession();
    try {
      const cypher = `
        MERGE (p:Person {id: $id})
        SET p.name = $name,
            p.panOrAadhaarHash = $panOrAadhaarHash,
            p.ownershipType = $ownershipType,
            p.updatedAt = datetime()
        RETURN p
      `;
      const res = await session.run(cypher, {
        id: person.id,
        name: person.name,
        panOrAadhaarHash: person.panOrAadhaarHash,
        ownershipType: person.ownershipType || 'INDIVIDUAL',
      });
      return res.records[0]?.get('p').properties;
    } catch (err) {
      this.logger.error(`Error saving Neo4j Person node: ${err.message}`);
      return person;
    } finally {
      await session.close();
    }
  }

  // 2. Create or Match Land Node
  async createOrUpdateLand(land: {
    landId: string;
    surveyNumber: string;
    state: string;
    district: string;
    taluk: string;
    village: string;
    areaInAcres: number;
    landType: string;
  }) {
    const session = this.getSession();
    try {
      const cypher = `
        MERGE (l:Land {landId: $landId})
        SET l.surveyNumber = $surveyNumber,
            l.state = $state,
            l.district = $district,
            l.taluk = $taluk,
            l.village = $village,
            l.areaInAcres = $areaInAcres,
            l.landType = $landType,
            l.updatedAt = datetime()
        RETURN l
      `;
      const res = await session.run(cypher, land);
      return res.records[0]?.get('l').properties;
    } catch (err) {
      this.logger.error(`Error saving Neo4j Land node: ${err.message}`);
      return land;
    } finally {
      await session.close();
    }
  }

  // 3. Record Ownership Transfer (Preserving Lineage)
  async recordOwnershipTransfer(data: {
    transactionId: string;
    landId: string;
    fromOwnerId: string;
    fromOwnerName: string;
    toOwnerId: string;
    toOwnerName: string;
    toOwnerIdHash: string;
    deedNumber: string;
    registrationDate: string;
    transferType: string;
    considerationAmountINR: number;
    sroOffice: string;
  }) {
    const session = this.getSession();
    try {
      // 1. Ensure new owner person node exists
      await this.createOrUpdatePerson({
        id: data.toOwnerId,
        name: data.toOwnerName,
        panOrAadhaarHash: data.toOwnerIdHash,
      });

      // 2. Transition Previous OWNS relationship to PREVIOUS_OWNER_OF and create new OWNS
      const cypher = `
        MATCH (l:Land {landId: $landId})
        MATCH (to:Person {id: $toOwnerId})
        
        // Match existing current owner if present and convert to PREVIOUS_OWNER_OF
        OPTIONAL MATCH (from:Person)-[currOwn:OWNS]->(l)
        DELETE currOwn
        WITH l, to, from
        WHERE from IS NOT NULL
        CREATE (from)-[:PREVIOUS_OWNER_OF {relinquishedAt: $registrationDate}]->(l)
        
        // Create Transaction Node
        WITH l, to
        CREATE (t:Transaction {
          id: $transactionId,
          deedNumber: $deedNumber,
          transferType: $transferType,
          considerationINR: $considerationAmountINR,
          registrationDate: $registrationDate,
          sroOffice: $sroOffice,
          createdAt: datetime()
        })
        
        // Create Relationships
        CREATE (to)-[:OWNS {acquiredAt: $registrationDate, deedNumber: $deedNumber}]->(l)
        CREATE (to)-[:PARTY_TO {role: 'BUYER_OR_TRANSFEREE'}]->(t)
        CREATE (t)-[:FOR_LAND]->(l)
        
        RETURN t, to, l
      `;

      await session.run(cypher, {
        landId: data.landId,
        toOwnerId: data.toOwnerId,
        transactionId: data.transactionId,
        deedNumber: data.deedNumber,
        transferType: data.transferType,
        considerationAmountINR: data.considerationAmountINR,
        registrationDate: data.registrationDate,
        sroOffice: data.sroOffice,
      });

      this.logger.log(
        `Neo4j ownership graph updated for Land ${data.landId}: Transfer from ${data.fromOwnerName} to ${data.toOwnerName}`,
      );
    } catch (err) {
      this.logger.error(`Error executing Neo4j transfer transaction: ${err.message}`);
    } finally {
      await session.close();
    }
  }

  // 4. Query Complete Ownership Lineage Chain
  async getOwnershipLineage(landId: string): Promise<Neo4jOwnershipChain> {
    const session = this.getSession();
    try {
      const cypher = `
        MATCH (l:Land {landId: $landId})
        OPTIONAL MATCH (curr:Person)-[o:OWNS]->(l)
        OPTIONAL MATCH (prev:Person)-[p:PREVIOUS_OWNER_OF]->(l)
        OPTIONAL MATCH (t:Transaction)-[:FOR_LAND]->(l)
        RETURN curr, o, collect(DISTINCT prev) as previousOwners, collect(DISTINCT t) as transactions
      `;

      const res = await session.run(cypher, { landId });
      if (!res.records || res.records.length === 0) {
        return {
          currentOwner: null,
          previousOwners: [],
          totalTransfers: 0,
          transactions: [],
          nodes: [],
          relationships: [],
        };
      }

      const record = res.records[0];
      const currentPerson = record.get('curr')?.properties || null;
      const ownsRel = record.get('o')?.properties || null;
      const prevPersons = record.get('previousOwners').map((p: any) => p.properties);
      const txs = record.get('transactions').map((t: any) => t.properties);

      return {
        currentOwner: currentPerson ? { ...currentPerson, ...ownsRel } : null,
        previousOwners: prevPersons,
        totalTransfers: txs.length,
        transactions: txs,
        nodes: [currentPerson, ...prevPersons].filter(Boolean),
        relationships: [],
      };
    } catch (err) {
      this.logger.error(`Error fetching Neo4j ownership lineage for ${landId}: ${err.message}`);
      return {
        currentOwner: null,
        previousOwners: [],
        totalTransfers: 0,
        transactions: [],
        nodes: [],
        relationships: [],
      };
    } finally {
      await session.close();
    }
  }
}
