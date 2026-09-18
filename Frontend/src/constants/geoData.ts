// Indian Administrative Hierarchy (Country -> State -> District -> Taluk -> Village/Ward)

export interface TalukData {
  name: string;
  villages: string[];
}

export interface DistrictData {
  name: string;
  taluks: TalukData[];
}

export interface StateData {
  name: string;
  code: string;
  districts: DistrictData[];
}

export const INDIA_STATES_DATA: StateData[] = [
  {
    name: 'Tamil Nadu',
    code: 'TN',
    districts: [
      {
        name: 'Chennai',
        taluks: [
          { name: 'Ambattur', villages: ['Ambattur OT', 'Padi', 'Korattur', 'Mogappair'] },
          { name: 'Ayanavaram', villages: ['Ayanavaram East', 'Kilpauk North', 'Konnor'] },
          { name: 'Guindy', villages: ['Alandur', 'Ekkattuthangal', 'St. Thomas Mount'] },
          { name: 'Mylapore', villages: ['Mylapore Urban', 'Mandaveli', 'Raja Annamalaipuram'] },
          { name: 'Velachery', villages: ['Velachery Main', 'Taramani', 'Madipakkam'] }
        ]
      },
      {
        name: 'Coimbatore',
        taluks: [
          { name: 'Coimbatore North', villages: ['Ganapathy', 'Saravanampatti', 'Thudiyalur'] },
          { name: 'Coimbatore South', villages: ['Ramanathapuram', 'Singanallur', 'Kuniyamuthur'] },
          { name: 'Pollachi', villages: ['Pollachi Town', 'Anamalai', 'Kinathukadavu'] }
        ]
      },
      {
        name: 'Madurai',
        taluks: [
          { name: 'Madurai North', villages: ['Othakadai', 'Tallakulam', 'Thiruppalai'] },
          { name: 'Madurai South', villages: ['Avaniapuram', 'Thiruparankundram', 'Villapuram'] }
        ]
      },
      {
        name: 'Kanchipuram',
        taluks: [
          { name: 'Sriperumbudur', villages: ['Sriperumbudur Hub', 'Irungattukottai', 'Mambakkam'] },
          { name: 'Kanchipuram', villages: ['Orikkai', 'Periya Kanchipuram', 'Chinna Kanchipuram'] }
        ]
      }
    ]
  },
  {
    name: 'Karnataka',
    code: 'KA',
    districts: [
      {
        name: 'Bengaluru Urban',
        taluks: [
          { name: 'Bengaluru North', villages: ['Yelahanka', 'Hebbal', 'Peenya Industrial Area'] },
          { name: 'Bengaluru South', villages: ['Jayanagar', 'JP Nagar', 'Electronic City Phase 1'] },
          { name: 'Bengaluru East', villages: ['Whitefield', 'KR Puram', 'Marathahalli'] },
          { name: 'Anekal', villages: ['Anekal Town', 'Attibele', 'Jigani'] }
        ]
      },
      {
        name: 'Mysuru',
        taluks: [
          { name: 'Mysuru Urban', villages: ['Chamundi Hill Foothills', 'Gokulam', 'Vijayanagar'] },
          { name: 'Hunsur', villages: ['Hunsur Town', 'Bilikere', 'Rathehalli'] }
        ]
      }
    ]
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    districts: [
      {
        name: 'Pune',
        taluks: [
          { name: 'Haveli', villages: ['Hinjawadi', 'Wakad', 'Hadapsar', 'Kharadi'] },
          { name: 'Pune City', villages: ['Shivajinagar', 'Kothrud', 'Baner'] },
          { name: 'Mulshi', villages: ['Pirangut', 'Paud', 'Lavasa Corridor'] }
        ]
      },
      {
        name: 'Mumbai Suburban',
        taluks: [
          { name: 'Andheri', villages: ['Andheri East MIDC', 'Andheri West', 'Marol'] },
          { name: 'Borivali', villages: ['Borivali West', 'Kandivali East', 'Dahisar'] }
        ]
      }
    ]
  },
  {
    name: 'Telangana',
    code: 'TS',
    districts: [
      {
        name: 'Hyderabad',
        taluks: [
          { name: 'Shaikpet', villages: ['Jubilee Hills', 'Banjara Hills', 'Film Nagar'] },
          { name: 'Serilingampally', villages: ['Gachibowli', 'Madhapur', 'Kondapur', 'HITEC City'] },
          { name: 'Secunderabad', villages: ['Marredpally', 'Begumpet', 'Trimulgherry'] }
        ]
      }
    ]
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    districts: [
      {
        name: 'Ahmedabad',
        taluks: [
          { name: 'Ahmedabad City', villages: ['Navrangpura', 'Bodakdev', 'Vastrapur'] },
          { name: 'Daskroi', villages: ['Sanand Road', 'Bopal', 'Shela'] }
        ]
      },
      {
        name: 'Gandhinagar',
        taluks: [
          { name: 'Gandhinagar', villages: ['GIFT City Corridor', 'Sector 10', 'Infocity'] }
        ]
      }
    ]
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    districts: [
      {
        name: 'Gautam Buddha Nagar',
        taluks: [
          { name: 'Noida', villages: ['Sector 62', 'Sector 137', 'Sector 18 Commercial'] },
          { name: 'Dadri', villages: ['Greater Noida West', 'Knowledge Park II', 'Alpha 1'] }
        ]
      },
      {
        name: 'Lucknow',
        taluks: [
          { name: 'Lucknow Sadar', villages: ['Gomti Nagar', 'Hazratganj', 'Alambagh'] },
          { name: 'Sarojini Nagar', villages: ['Amausi', 'Transport Nagar', 'Shaheed Path'] }
        ]
      }
    ]
  }
];

export const ALL_STATES = INDIA_STATES_DATA.map(s => s.name);

export const getDistrictsForState = (stateName: string): string[] => {
  const st = INDIA_STATES_DATA.find(s => s.name.toLowerCase() === stateName.toLowerCase());
  return st ? st.districts.map(d => d.name) : [];
};

export const getTaluksForDistrict = (stateName: string, districtName: string): string[] => {
  const st = INDIA_STATES_DATA.find(s => s.name.toLowerCase() === stateName.toLowerCase());
  if (!st) return [];
  const dist = st.districts.find(d => d.name.toLowerCase() === districtName.toLowerCase());
  return dist ? dist.taluks.map(t => t.name) : [];
};

export const getVillagesForTaluk = (stateName: string, districtName: string, talukName: string): string[] => {
  const st = INDIA_STATES_DATA.find(s => s.name.toLowerCase() === stateName.toLowerCase());
  if (!st) return [];
  const dist = st.districts.find(d => d.name.toLowerCase() === districtName.toLowerCase());
  if (!dist) return [];
  const taluk = dist.taluks.find(t => t.name.toLowerCase() === talukName.toLowerCase());
  return taluk ? taluk.villages : [];
};
