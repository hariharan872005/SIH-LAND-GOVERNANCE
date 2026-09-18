"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Neo4jService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neo4jService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const neo4j_driver_1 = require("neo4j-driver");
let Neo4jService = Neo4jService_1 = class Neo4jService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(Neo4jService_1.name);
        this.isConnected = false;
    }
    async onModuleInit() {
        const uri = this.configService.get('NEO4J_URI', 'bolt://localhost:7687');
        const username = this.configService.get('NEO4J_USERNAME', 'neo4j');
        const password = this.configService.get('NEO4J_PASSWORD', 'neo4j_secret_pass');
        try {
            this.driver = neo4j_driver_1.default.driver(uri, neo4j_driver_1.default.auth.basic(username, password), {
                maxConnectionLifetime: 3 * 60 * 60 * 1000,
                maxConnectionPoolSize: 50,
            });
            const serverInfo = await this.driver.getServerInfo();
            this.isConnected = true;
            this.logger.log(`Connected to Neo4j Graph DB: ${serverInfo.address} (${serverInfo.agent})`);
            await this.initializeGraphSchema();
        }
        catch (err) {
            this.logger.warn(`Neo4j connection deferred (will retry on demand): ${err.message}`);
        }
    }
    async onModuleDestroy() {
        if (this.driver) {
            await this.driver.close();
        }
    }
    async initializeGraphSchema() {
        const session = this.getSession();
        try {
            await session.run(`CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE`);
            await session.run(`CREATE CONSTRAINT land_id_unique IF NOT EXISTS FOR (l:Land) REQUIRE l.landId IS UNIQUE`);
            await session.run(`CREATE CONSTRAINT tx_id_unique IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE`);
            this.logger.log('Neo4j unique constraints verified.');
        }
        catch (err) {
            this.logger.debug(`Schema initialization note: ${err.message}`);
        }
        finally {
            await session.close();
        }
    }
    getSession() {
        if (!this.driver) {
            const uri = this.configService.get('NEO4J_URI', 'bolt://localhost:7687');
            const username = this.configService.get('NEO4J_USERNAME', 'neo4j');
            const password = this.configService.get('NEO4J_PASSWORD', 'neo4j_secret_pass');
            this.driver = neo4j_driver_1.default.driver(uri, neo4j_driver_1.default.auth.basic(username, password));
        }
        return this.driver.session();
    }
    async createOrUpdatePerson(person) {
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
        }
        catch (err) {
            this.logger.error(`Error saving Neo4j Person node: ${err.message}`);
            return person;
        }
        finally {
            await session.close();
        }
    }
    async createOrUpdateLand(land) {
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
        }
        catch (err) {
            this.logger.error(`Error saving Neo4j Land node: ${err.message}`);
            return land;
        }
        finally {
            await session.close();
        }
    }
    async recordOwnershipTransfer(data) {
        const session = this.getSession();
        try {
            await this.createOrUpdatePerson({
                id: data.toOwnerId,
                name: data.toOwnerName,
                panOrAadhaarHash: data.toOwnerIdHash,
            });
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
            this.logger.log(`Neo4j ownership graph updated for Land ${data.landId}: Transfer from ${data.fromOwnerName} to ${data.toOwnerName}`);
        }
        catch (err) {
            this.logger.error(`Error executing Neo4j transfer transaction: ${err.message}`);
        }
        finally {
            await session.close();
        }
    }
    async getOwnershipLineage(landId) {
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
            const prevPersons = record.get('previousOwners').map((p) => p.properties);
            const txs = record.get('transactions').map((t) => t.properties);
            return {
                currentOwner: currentPerson ? { ...currentPerson, ...ownsRel } : null,
                previousOwners: prevPersons,
                totalTransfers: txs.length,
                transactions: txs,
                nodes: [currentPerson, ...prevPersons].filter(Boolean),
                relationships: [],
            };
        }
        catch (err) {
            this.logger.error(`Error fetching Neo4j ownership lineage for ${landId}: ${err.message}`);
            return {
                currentOwner: null,
                previousOwners: [],
                totalTransfers: 0,
                transactions: [],
                nodes: [],
                relationships: [],
            };
        }
        finally {
            await session.close();
        }
    }
};
exports.Neo4jService = Neo4jService;
exports.Neo4jService = Neo4jService = Neo4jService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], Neo4jService);
//# sourceMappingURL=neo4j.service.js.map