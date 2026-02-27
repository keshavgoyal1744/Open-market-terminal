const ENTITY_DIRECTORY = {
  AAPL: { id: "AAPL", label: "Apple", kind: "issuer", symbol: "AAPL" },
  NVDA: { id: "NVDA", label: "Nvidia", kind: "issuer", symbol: "NVDA" },
  TSLA: { id: "TSLA", label: "Tesla", kind: "issuer", symbol: "TSLA" },
  MSFT: { id: "MSFT", label: "Microsoft", kind: "issuer", symbol: "MSFT" },
  GOOGL: { id: "GOOGL", label: "Alphabet", kind: "issuer", symbol: "GOOGL" },
  AMZN: { id: "AMZN", label: "Amazon", kind: "issuer", symbol: "AMZN" },
  META: { id: "META", label: "Meta Platforms", kind: "issuer", symbol: "META" },
  JPM: { id: "JPM", label: "JPMorgan Chase", kind: "issuer", symbol: "JPM" },
  XOM: { id: "XOM", label: "Exxon Mobil", kind: "issuer", symbol: "XOM" },
  UNH: { id: "UNH", label: "UnitedHealth Group", kind: "issuer", symbol: "UNH" },
  TSM: { id: "TSM", label: "TSMC", kind: "partner", symbol: "TSM" },
  ASML: { id: "ASML", label: "ASML", kind: "supplier", symbol: "ASML" },
  AMD: { id: "AMD", label: "AMD", kind: "competitor", symbol: "AMD" },
  INTC: { id: "INTC", label: "Intel", kind: "competitor", symbol: "INTC" },
  QCOM: { id: "QCOM", label: "Qualcomm", kind: "competitor", symbol: "QCOM" },
  MU: { id: "MU", label: "Micron", kind: "supplier", symbol: "MU" },
  AVGO: { id: "AVGO", label: "Broadcom", kind: "supplier", symbol: "AVGO" },
  ALB: { id: "ALB", label: "Albemarle", kind: "supplier", symbol: "ALB" },
  SQM: { id: "SQM", label: "SQM", kind: "supplier", symbol: "SQM" },
  UPS: { id: "UPS", label: "UPS", kind: "partner", symbol: "UPS" },
  FDX: { id: "FDX", label: "FedEx", kind: "partner", symbol: "FDX" },
  WMT: { id: "WMT", label: "Walmart", kind: "customer", symbol: "WMT" },
  GM: { id: "GM", label: "General Motors", kind: "competitor", symbol: "GM" },
  F: { id: "F", label: "Ford", kind: "competitor", symbol: "F" },
  RIVN: { id: "RIVN", label: "Rivian", kind: "competitor", symbol: "RIVN" },
  SNAP: { id: "SNAP", label: "Snap", kind: "competitor", symbol: "SNAP" },
  PINS: { id: "PINS", label: "Pinterest", kind: "competitor", symbol: "PINS" },
  BAC: { id: "BAC", label: "Bank of America", kind: "competitor", symbol: "BAC" },
  GS: { id: "GS", label: "Goldman Sachs", kind: "competitor", symbol: "GS" },
  V: { id: "V", label: "Visa", kind: "partner", symbol: "V" },
  MA: { id: "MA", label: "Mastercard", kind: "partner", symbol: "MA" },
  CVX: { id: "CVX", label: "Chevron", kind: "competitor", symbol: "CVX" },
  SLB: { id: "SLB", label: "SLB", kind: "supplier", symbol: "SLB" },
  HUM: { id: "HUM", label: "Humana", kind: "competitor", symbol: "HUM" },
  ELV: { id: "ELV", label: "Elevance Health", kind: "competitor", symbol: "ELV" },
  MRK: { id: "MRK", label: "Merck", kind: "partner", symbol: "MRK" },
  CRM: { id: "CRM", label: "Salesforce", kind: "partner", symbol: "CRM" },
  ORCL: { id: "ORCL", label: "Oracle", kind: "competitor", symbol: "ORCL" },
  MRVL: { id: "MRVL", label: "Marvell", kind: "supplier", symbol: "MRVL" },
  BROKERS: { id: "BROKERS", label: "Broker / Advisor Channels", kind: "customer" },
  ADSK: { id: "ADSK", label: "Autodesk", kind: "partner", symbol: "ADSK" },
  CHPT: { id: "CHPT", label: "ChargePoint", kind: "ecosystem", symbol: "CHPT" },
  UBER: { id: "UBER", label: "Uber", kind: "partner", symbol: "UBER" },
  GITHUB: { id: "GITHUB", label: "GitHub", kind: "subsidiary" },
  LINKEDIN: { id: "LINKEDIN", label: "LinkedIn", kind: "subsidiary" },
  OPENAI: { id: "OPENAI", label: "OpenAI", kind: "investment" },
  ACTIVISION: { id: "ACTIVISION", label: "Activision Blizzard", kind: "subsidiary" },
  GOOGLE: { id: "GOOGLE", label: "Google", kind: "subsidiary" },
  YOUTUBE: { id: "YOUTUBE", label: "YouTube", kind: "subsidiary" },
  WAYMO: { id: "WAYMO", label: "Waymo", kind: "subsidiary" },
  DEEPMIND: { id: "DEEPMIND", label: "DeepMind", kind: "subsidiary" },
  AWS: { id: "AWS", label: "AWS", kind: "subsidiary" },
  WHOLEFOODS: { id: "WHOLEFOODS", label: "Whole Foods", kind: "subsidiary" },
  ZOOX: { id: "ZOOX", label: "Zoox", kind: "subsidiary" },
  INSTAGRAM: { id: "INSTAGRAM", label: "Instagram", kind: "subsidiary" },
  WHATSAPP: { id: "WHATSAPP", label: "WhatsApp", kind: "subsidiary" },
  REALITYLABS: { id: "REALITYLABS", label: "Reality Labs", kind: "subsidiary" },
  BATTERY: { id: "BATTERY", label: "Battery Makers", kind: "ecosystem" },
  LITHIUM: { id: "LITHIUM", label: "Lithium Miners", kind: "ecosystem" },
  CLOUD: { id: "CLOUD", label: "Cloud Customers", kind: "customer" },
  CONSUMERS: { id: "CONSUMERS", label: "Consumer Channels", kind: "customer" },
};

const GRAPH_BY_SYMBOL = {
  AAPL: {
    headline: "Consumer device platform with custom silicon, services, and concentrated hardware manufacturing dependencies.",
    coverageNotes: [
      "Supply-chain links are curated from public reporting and public-company disclosures.",
      "Counterparty intensity is qualitative, not a licensed revenue-share feed.",
    ],
    peerSymbols: ["MSFT", "GOOGL", "AMZN", "META"],
    competitorSymbols: ["MSFT", "GOOGL", "QCOM", "AMZN"],
    relationships: [
      relation("TSM", "supplier", "supply-chain", "Advanced-node foundry", 5),
      relation("ASML", "second-order supplier", "supply-chain", "Lithography bottleneck to TSMC capacity", 4),
      relation("AVGO", "supplier", "supply-chain", "Connectivity and custom component exposure", 3),
      relation("UPS", "logistics partner", "supply-chain", "Distribution and fulfillment throughput", 3),
      relation("FDX", "logistics partner", "supply-chain", "Global device logistics", 2),
      relation("CONSUMERS", "customer base", "customer", "Global retail and channel demand", 5),
      relation("MSFT", "platform competitor", "competition", "Productivity and AI ecosystem competition", 3),
      relation("GOOGL", "platform competitor", "competition", "Mobile services and AI ecosystem competition", 3),
      relation("QCOM", "chip ecosystem competitor", "competition", "Modem and mobile silicon competition", 2),
    ],
    corporate: [
      corporate("AAPL", "subsidiary", "Apple Services", "Services and subscriptions layer"),
      corporate("AAPL", "subsidiary", "Apple Silicon", "Internal chip design organization"),
      corporate("AAPL", "acquisition", "Beats", "Wearables and services adjacency"),
    ],
    customerConcentration: [
      concentration("Consumer channels", "Diversified", "Retail demand is broad; concentration is more manufacturing-side than end-customer-side."),
      concentration("Carrier and reseller channels", "Moderate", "Distribution partners matter, but no single disclosed buyer dominates public filings."),
    ],
    executives: [
      executive("Tim Cook", "CEO", ["Apple", "Compaq", "IBM"]),
      executive("Luca Maestri", "CFO", ["Apple", "Xerox", "Nokia Siemens"]),
      executive("Sabih Khan", "Operations", ["Apple", "GE Plastics"]),
    ],
    geography: {
      revenueMix: weights([
        ["Americas", 5, "Core demand region"],
        ["Europe", 4, "Large installed base"],
        ["Greater China", 4, "Demand and manufacturing exposure"],
        ["Japan", 2, "Specialized high-value market"],
        ["Rest of APAC", 3, "Regional growth and assembly diversification"],
      ]),
      manufacturing: weights([
        ["China", 5, "Primary assembly concentration"],
        ["India", 3, "Growing iPhone assembly footprint"],
        ["Vietnam", 2, "Peripheral device and component diversification"],
      ]),
      supplyRegions: weights([
        ["Taiwan", 5, "Leading-edge semiconductor dependency"],
        ["Japan", 3, "Materials and equipment exposure"],
        ["US/Europe", 2, "Design and high-end component supply"],
      ]),
    },
    ecosystems: [
      ecosystem("Consumer devices", ["Silicon", "Assembly", "Logistics", "Retail channels"]),
      ecosystem("AI-enabled devices", ["Custom chips", "Model integration", "Services monetization"]),
    ],
    eventChains: [
      impact("Taiwan fab disruption", ["TSMC output tightens", "Apple silicon lead times widen", "Device launch mix and margins come under pressure"]),
      impact("Consumer demand rebound", ["iPhone upgrade cycle improves", "Component orders rise", "Key suppliers and logistics partners re-rate"]),
    ],
  },
  NVDA: {
    headline: "AI compute leader with a tight dependency chain across foundry capacity, lithography, memory, and hyperscale demand.",
    coverageNotes: [
      "This map emphasizes second-order AI hardware linkages that traders often monitor around earnings and capacity updates.",
    ],
    peerSymbols: ["AMD", "INTC", "TSM", "ASML"],
    competitorSymbols: ["AMD", "INTC", "QCOM"],
    relationships: [
      relation("TSM", "supplier", "supply-chain", "GPU and accelerator fabrication", 5),
      relation("ASML", "second-order supplier", "supply-chain", "Critical lithography for foundry expansion", 4),
      relation("MU", "supplier", "supply-chain", "Memory ecosystem sensitivity", 4),
      relation("MSFT", "hyperscale customer", "customer", "Cloud AI demand", 5),
      relation("AMZN", "hyperscale customer", "customer", "AI infrastructure demand", 4),
      relation("GOOGL", "hyperscale customer", "customer", "Cloud and model training demand", 4),
      relation("META", "model customer", "customer", "Generative AI infrastructure demand", 4),
      relation("AMD", "accelerator competitor", "competition", "Datacenter AI accelerator competition", 4),
      relation("INTC", "platform competitor", "competition", "CPU/GPU datacenter platform competition", 3),
    ],
    corporate: [
      corporate("NVDA", "subsidiary", "Networking / interconnect", "InfiniBand and Ethernet fabric layer"),
      corporate("NVDA", "acquisition", "Mellanox", "Cluster networking leverage"),
    ],
    customerConcentration: [
      concentration("Hyperscalers", "High", "Cloud and model builders account for the most visible demand concentration."),
      concentration("Enterprise AI", "Rising", "Broader adoption is growing but still smaller than hyperscaler demand."),
    ],
    executives: [
      executive("Jensen Huang", "CEO", ["Nvidia", "LSI Logic", "AMD"]),
      executive("Colette Kress", "CFO", ["Nvidia", "Cisco", "Texas Instruments"]),
    ],
    geography: {
      revenueMix: weights([
        ["US cloud demand", 5, "Largest visible AI demand center"],
        ["Taiwan manufacturing", 5, "Fabrication dependency"],
        ["Asia electronics chain", 4, "Assembly and component integration"],
        ["Europe enterprise AI", 2, "Smaller but growing demand pocket"],
      ]),
      manufacturing: weights([
        ["Taiwan", 5, "Foundry concentration"],
        ["Southeast Asia", 3, "Assembly and board partners"],
      ]),
      supplyRegions: weights([
        ["Taiwan", 5, "Fabrication and packaging sensitivity"],
        ["US", 3, "Networking and software stack"],
        ["Japan / Netherlands", 3, "Equipment and materials"],
      ]),
    },
    ecosystems: [
      ecosystem("AI compute", ["Lithography", "Foundry", "Memory", "Networking", "Hyperscaler demand"]),
      ecosystem("Autonomous / edge AI", ["Inference chips", "Software stack", "Embedded systems"]),
    ],
    eventChains: [
      impact("Nvidia beats on datacenter demand", ["TSMC capacity narrative strengthens", "ASML demand expectations improve", "Memory suppliers and AI networking names may follow"]),
      impact("Packaging bottleneck", ["Shipment timing slips", "Cloud capex digestion matters more", "Competitor share opportunity appears"]),
    ],
  },
  TSLA: {
    headline: "EV and energy platform with upstream battery-material dependencies and downstream charging, software, and fleet effects.",
    coverageNotes: [
      "Battery-material and charging layers are modeled qualitatively from public ecosystem knowledge.",
    ],
    peerSymbols: ["ALB", "SQM", "CHPT", "TSM"],
    competitorSymbols: ["GM", "F", "RIVN"],
    relationships: [
      relation("ALB", "supplier", "supply-chain", "Lithium exposure", 4),
      relation("SQM", "supplier", "supply-chain", "Lithium exposure", 4),
      relation("BATTERY", "supplier cluster", "supply-chain", "Cell makers and pack economics", 5),
      relation("CHPT", "ecosystem node", "ecosystem", "Charging infrastructure read-through", 3),
      relation("UBER", "fleet platform", "ecosystem", "Autonomy / fleet optionality", 2),
      relation("AAPL", "consumer attention competitor", "competition", "Premium consumer mindshare and device ecosystem overlap", 1),
    ],
    corporate: [
      corporate("TSLA", "subsidiary", "Energy Generation & Storage", "Grid and battery storage business"),
      corporate("TSLA", "subsidiary", "Autonomy / FSD", "Software and robotaxi optionality"),
      corporate("TSLA", "acquisition", "SolarCity", "Energy platform expansion"),
    ],
    customerConcentration: [
      concentration("Vehicle buyers", "Moderate", "Direct retail model reduces classic distributor concentration."),
      concentration("Energy customers", "Growing", "Utility-scale storage is becoming a more material second engine."),
    ],
    executives: [
      executive("Elon Musk", "CEO", ["Tesla", "SpaceX", "X / PayPal lineage"]),
      executive("Vaibhav Taneja", "CFO", ["Tesla", "SolarCity", "PwC"]),
    ],
    geography: {
      revenueMix: weights([
        ["North America", 5, "Core auto and energy demand"],
        ["China", 4, "Critical EV volume and manufacturing base"],
        ["Europe", 3, "Important EV demand and regulatory market"],
      ]),
      manufacturing: weights([
        ["US", 5, "Vehicle and energy output"],
        ["China", 5, "Gigafactory concentration"],
        ["Germany", 3, "European assembly and logistics"],
      ]),
      supplyRegions: weights([
        ["Australia / Chile", 4, "Battery material dependence"],
        ["China", 4, "Battery and parts ecosystem"],
        ["North America", 3, "Regional localization push"],
      ]),
    },
    ecosystems: [
      ecosystem("Electric vehicles", ["Lithium", "Cells", "Vehicle assembly", "Charging", "Fleet software"]),
      ecosystem("Energy storage", ["Battery modules", "Utility customers", "Grid services"]),
    ],
    eventChains: [
      impact("Lithium price spike", ["Battery input costs rise", "EV margin pressure emerges", "Upstream miners can outperform OEMs"]),
      impact("Robotaxi progress", ["Autonomy narrative improves", "Charging and fleet ecosystem names gain sympathy bids", "Traditional auto comps reset"]),
    ],
  },
  MSFT: {
    headline: "Cloud, enterprise software, productivity, gaming, and AI platform with major enterprise and model-stack linkages.",
    coverageNotes: [
      "Investment and ecosystem links are curated and focused on public strategic relationships.",
    ],
    peerSymbols: ["AMZN", "GOOGL", "NVDA", "META"],
    competitorSymbols: ["AMZN", "GOOGL", "META"],
    relationships: [
      relation("OPENAI", "strategic investment", "investment", "Model and application stack partnership", 5),
      relation("NVDA", "supplier / ecosystem", "ecosystem", "AI infrastructure demand and platform exposure", 4),
      relation("AMZN", "cloud competitor", "competition", "AWS competition", 4),
      relation("GOOGL", "cloud / productivity competitor", "competition", "Workspace and cloud competition", 4),
      relation("CLOUD", "enterprise customer cluster", "customer", "Large-scale enterprise cloud and software demand", 5),
    ],
    corporate: [
      corporate("MSFT", "subsidiary", "LinkedIn", "Professional network and ads"),
      corporate("MSFT", "subsidiary", "GitHub", "Developer platform"),
      corporate("MSFT", "subsidiary", "Activision Blizzard", "Gaming content and distribution"),
    ],
    customerConcentration: [
      concentration("Enterprise IT budgets", "High", "Broadly diversified across industries but tied to global enterprise spend."),
      concentration("Cloud and AI workloads", "Rising", "AI monetization increases exposure to hyperscale build cycles."),
    ],
    executives: [
      executive("Satya Nadella", "CEO", ["Microsoft", "Sun Microsystems"]),
      executive("Amy Hood", "CFO", ["Microsoft", "Goldman Sachs"]),
      executive("Kevin Scott", "CTO", ["Microsoft", "LinkedIn", "Google"]),
    ],
    geography: {
      revenueMix: weights([
        ["North America", 5, "Enterprise and cloud base"],
        ["Europe", 4, "Large enterprise installed base"],
        ["Asia-Pacific", 3, "Growing cloud footprint"],
      ]),
      manufacturing: weights([
        ["Global data center regions", 5, "Cloud footprint rather than physical assembly"],
      ]),
      supplyRegions: weights([
        ["US", 4, "Platform, engineering, go-to-market"],
        ["Global cloud regions", 5, "Availability zone and capex sensitivity"],
      ]),
    },
    ecosystems: [
      ecosystem("Cloud + AI", ["Model partner", "GPU supply", "Enterprise software", "Developer tooling"]),
      ecosystem("Gaming", ["Content", "Distribution", "Subscriptions"]),
    ],
    eventChains: [
      impact("Azure AI acceleration", ["OpenAI usage scales", "GPU demand remains tight", "Cloud software multiples expand"]),
      impact("Enterprise slowdown", ["Seat expansion cools", "Cloud optimization persists", "Peer software names feel the pressure"]),
    ],
  },
  GOOGL: {
    headline: "Search, ads, cloud, video, and autonomous platform with a visible corporate tree and AI ecosystem reach.",
    peerSymbols: ["MSFT", "META", "AMZN", "NVDA"],
    competitorSymbols: ["MSFT", "META", "AMZN"],
    relationships: [
      relation("MSFT", "AI / cloud competitor", "competition", "Search, cloud, productivity, and model competition", 5),
      relation("META", "digital ads competitor", "competition", "Ad market share and attention competition", 4),
      relation("NVDA", "AI infrastructure supplier", "ecosystem", "Cloud AI capex sensitivity", 4),
      relation("GOOGLE", "core subsidiary", "corporate", "Search, ads, Android, and cloud operations", 5),
      relation("YOUTUBE", "core subsidiary", "corporate", "Video platform and creator economy", 5),
      relation("WAYMO", "subsidiary", "corporate", "Autonomous mobility option value", 3),
      relation("DEEPMIND", "subsidiary", "corporate", "Model research and AI talent concentration", 4),
    ],
    corporate: [
      corporate("GOOGL", "subsidiary", "Google", "Core search, ads, Android, cloud"),
      corporate("GOOGL", "subsidiary", "YouTube", "Video and creator economy"),
      corporate("GOOGL", "subsidiary", "Waymo", "Autonomous systems"),
      corporate("GOOGL", "subsidiary", "DeepMind", "AI research"),
    ],
    customerConcentration: [
      concentration("Advertisers", "Diversified", "Broad ad-base diversification but macro-sensitive."),
      concentration("Cloud customers", "Rising", "AI and cloud enterprise wins add strategic concentration."),
    ],
    executives: [
      executive("Sundar Pichai", "CEO", ["Google", "McKinsey"]),
      executive("Ruth Porat", "President / CIO", ["Alphabet", "Morgan Stanley"]),
    ],
    geography: {
      revenueMix: weights([
        ["US", 5, "Core ad and cloud market"],
        ["Europe", 4, "Large ad footprint"],
        ["Asia-Pacific", 3, "Growth and Android reach"],
      ]),
      manufacturing: weights([
        ["Global data centers", 5, "Cloud and AI infrastructure footprint"],
      ]),
      supplyRegions: weights([
        ["US", 4, "Engineering and ad stack"],
        ["Global regions", 4, "Cloud serving footprint"],
      ]),
    },
    ecosystems: [
      ecosystem("Internet services", ["Search", "Ads", "Android", "Video", "Cloud"]),
      ecosystem("Autonomous systems", ["AI research", "Mapping", "Fleet operations"]),
    ],
    eventChains: [
      impact("Search monetization improves", ["Ad peers re-rate", "Cloud and AI spend get more breathing room", "Ad-tech ecosystem benefits"]),
      impact("Cloud AI capex ramps", ["GPU demand firms", "Cloud peers respond", "Data center suppliers gain read-through"]),
    ],
  },
  AMZN: {
    headline: "E-commerce, logistics, cloud, ads, and consumer ecosystem with dense fulfillment and cloud linkages.",
    peerSymbols: ["MSFT", "GOOGL", "WMT", "NVDA"],
    competitorSymbols: ["MSFT", "WMT", "GOOGL"],
    relationships: [
      relation("WMT", "retail competitor", "competition", "Consumer commerce competition", 4),
      relation("MSFT", "cloud competitor", "competition", "AWS competition", 4),
      relation("GOOGL", "cloud / ads competitor", "competition", "Cloud and ads competition", 3),
      relation("UPS", "logistics partner", "supply-chain", "Package network spillover", 2),
      relation("FDX", "logistics comparator", "supply-chain", "Shipping rate sensitivity", 2),
      relation("NVDA", "AI infrastructure supplier", "ecosystem", "AWS AI and training demand", 4),
    ],
    corporate: [
      corporate("AMZN", "subsidiary", "AWS", "Cloud engine"),
      corporate("AMZN", "subsidiary", "Whole Foods", "Physical retail and grocery"),
      corporate("AMZN", "subsidiary", "Zoox", "Autonomous mobility option"),
    ],
    customerConcentration: [
      concentration("Online consumers", "Diversified", "Large retail base rather than single-buyer concentration."),
      concentration("Enterprise cloud customers", "Broad", "AWS spreads exposure across industries and workloads."),
    ],
    executives: [
      executive("Andy Jassy", "CEO", ["Amazon", "AWS"]),
      executive("Brian Olsavsky", "CFO", ["Amazon", "BF Goodrich"]),
    ],
    geography: {
      revenueMix: weights([
        ["North America", 5, "Retail and cloud anchor"],
        ["International", 4, "Retail logistics and marketplace growth"],
      ]),
      manufacturing: weights([
        ["Global fulfillment network", 5, "Warehouse and last-mile coverage"],
      ]),
      supplyRegions: weights([
        ["North America", 5, "Fulfillment density"],
        ["Europe", 3, "Retail and cloud regions"],
        ["Asia", 3, "Marketplace and sourcing"],
      ]),
    },
    ecosystems: [
      ecosystem("Commerce", ["Suppliers", "Fulfillment", "Advertising", "Prime demand"]),
      ecosystem("Cloud", ["AI chips", "Developer workloads", "Enterprise migrations"]),
    ],
    eventChains: [
      impact("Holiday demand surprise", ["Logistics carriers reprice", "Advertising mix improves", "Consumer discretionary peers move"]),
      impact("AWS acceleration", ["GPU and data center suppliers gain", "Cloud peers trade on AI capacity"],),
    ],
  },
  META: {
    headline: "Digital advertising and social graph platform with AI infrastructure and messaging ecosystem linkages.",
    peerSymbols: ["GOOGL", "MSFT", "NVDA", "AMZN"],
    competitorSymbols: ["GOOGL", "SNAP", "PINS"],
    relationships: [
      relation("INSTAGRAM", "subsidiary", "corporate", "Visual social and commerce surface", 5),
      relation("WHATSAPP", "subsidiary", "corporate", "Messaging and business messaging base", 5),
      relation("REALITYLABS", "subsidiary", "corporate", "AR/VR and hardware bets", 3),
      relation("NVDA", "AI infrastructure supplier", "ecosystem", "Model training and ranking systems demand", 4),
      relation("GOOGL", "ads competitor", "competition", "Digital ads competition", 4),
    ],
    corporate: [
      corporate("META", "subsidiary", "Instagram", "Social, creator, commerce"),
      corporate("META", "subsidiary", "WhatsApp", "Messaging"),
      corporate("META", "subsidiary", "Reality Labs", "AR/VR"),
    ],
    customerConcentration: [
      concentration("Advertisers", "Diversified", "Broad ad demand with macro sensitivity."),
      concentration("App ecosystem users", "Very broad", "Demand is diversified across consumer attention."),
    ],
    executives: [
      executive("Mark Zuckerberg", "CEO", ["Meta", "Facebook"]),
      executive("Susan Li", "CFO", ["Meta"]),
    ],
    geography: {
      revenueMix: weights([
        ["US / Canada", 5, "High-value ad market"],
        ["Europe", 4, "Large monetized base"],
        ["Asia-Pacific", 3, "Large user base with lower monetization"],
      ]),
      manufacturing: weights([
        ["Global data centers", 4, "Compute-heavy AI ranking infrastructure"],
      ]),
      supplyRegions: weights([
        ["US", 4, "Engineering and ad sales"],
        ["Global cloud / data center regions", 4, "AI infrastructure footprint"],
      ]),
    },
    ecosystems: [
      ecosystem("Ads + social", ["Consumer attention", "Advertisers", "Creators", "AI ranking"]),
      ecosystem("Messaging", ["Business tools", "Payments optionality", "Commerce"]),
    ],
    eventChains: [
      impact("Ad pricing strength", ["Digital ad comps move", "Consumer internet risk appetite improves"]),
      impact("AI capex surge", ["GPU suppliers re-rate", "Operating margin concerns rise short term"]),
    ],
  },
  AMD: {
    headline: "Compute challenger spanning CPUs, GPUs, and custom silicon with a similar foundry and packaging dependency stack to Nvidia, but broader PC and server mix.",
    peerSymbols: ["NVDA", "INTC", "TSM", "AVGO"],
    competitorSymbols: ["NVDA", "INTC", "QCOM"],
    relationships: [
      relation("TSM", "supplier", "supply-chain", "CPU and GPU fabrication dependency", 5),
      relation("ASML", "second-order supplier", "supply-chain", "Tooling sensitivity through foundry capacity", 4),
      relation("MRVL", "adjacent silicon ecosystem", "ecosystem", "Datacenter accelerator and connectivity adjacencies", 3),
      relation("MSFT", "cloud customer", "customer", "AI and server demand", 3),
      relation("NVDA", "AI accelerator competitor", "competition", "GPU datacenter competition", 5),
      relation("INTC", "CPU competitor", "competition", "x86 server and client competition", 4),
    ],
    corporate: [
      corporate("AMD", "acquisition", "Xilinx", "Adaptive compute and embedded systems"),
    ],
    customerConcentration: [
      concentration("Cloud / server customers", "Moderate", "Datacenter growth is concentrated in large infrastructure buyers."),
      concentration("PC OEMs", "Moderate", "Client exposure remains meaningful across PC cycles."),
    ],
    executives: [
      executive("Lisa Su", "CEO", ["AMD", "Freescale", "IBM"]),
      executive("Jean Hu", "CFO", ["AMD", "Marvell", "Qlogic"]),
    ],
    geography: {
      revenueMix: weights([
        ["Cloud / data center", 4, "Strategic growth engine"],
        ["PC and gaming", 4, "Cycle-sensitive end market"],
        ["Embedded / industrial", 2, "Diversification layer"],
      ]),
      manufacturing: weights([
        ["Taiwan", 5, "Foundry concentration"],
        ["Southeast Asia", 3, "Assembly and test ecosystem"],
      ]),
      supplyRegions: weights([
        ["Taiwan", 5, "Leading-edge silicon dependency"],
        ["US", 3, "Design and platform development"],
      ]),
    },
    ecosystems: [
      ecosystem("Compute platforms", ["Foundry", "Packaging", "Server OEMs", "Cloud demand"]),
    ],
    eventChains: [
      impact("Server share gains", ["Intel pressure increases", "TSMC capacity remains strategic", "Cloud hardware basket reacts"]),
      impact("AI GPU roadmap surprise", ["Nvidia relative trade tightens", "Memory and packaging names react"]),
    ],
  },
  AVGO: {
    headline: "Infrastructure silicon and software platform tied to networking, custom AI chips, enterprise software, and hyperscale capex.",
    peerSymbols: ["NVDA", "AMD", "MRVL", "ORCL"],
    competitorSymbols: ["MRVL", "NVDA", "AMD"],
    relationships: [
      relation("AAPL", "customer / partner", "customer", "Custom connectivity and handset exposure", 3),
      relation("GOOGL", "custom silicon customer", "customer", "Cloud networking and accelerator design exposure", 4),
      relation("META", "custom silicon customer", "customer", "AI networking and infrastructure exposure", 4),
      relation("MRVL", "networking competitor", "competition", "Datacenter networking competition", 3),
      relation("NVDA", "AI infrastructure peer", "competition", "Cluster and accelerator stack overlap", 2),
      relation("VMware", "software asset", "corporate", "Enterprise software layer", 4),
    ],
    corporate: [
      corporate("AVGO", "acquisition", "VMware", "Infrastructure software expansion"),
      corporate("AVGO", "acquisition", "CA Technologies", "Mainframe / enterprise software footprint"),
    ],
    customerConcentration: [
      concentration("Large platform customers", "High", "A few mega-cap customers matter in custom silicon and networking."),
      concentration("Enterprise software base", "Moderate", "More diversified recurring software footprint."),
    ],
    executives: [
      executive("Hock Tan", "CEO", ["Broadcom", "Avago", "PepsiCo / GE lineage"]),
    ],
    geography: {
      revenueMix: weights([
        ["Hyperscaler infrastructure", 5, "Custom silicon demand"],
        ["Enterprise software", 3, "Recurring software base"],
        ["Wireless / handset", 3, "Cycle-linked handset exposure"],
      ]),
      manufacturing: weights([
        ["Asia manufacturing partners", 4, "Semiconductor assembly and outsourced production"],
      ]),
      supplyRegions: weights([
        ["US", 3, "Design and software leadership"],
        ["Asia", 4, "Manufacturing and customer delivery footprint"],
      ]),
    },
    ecosystems: [
      ecosystem("AI networking", ["Custom silicon", "Hyperscalers", "Networking", "Enterprise software"]),
    ],
    eventChains: [
      impact("Hyperscaler AI capex surge", ["Networking demand rises", "Custom silicon demand expands", "Peer infrastructure names rerate"]),
    ],
  },
  TSM: {
    headline: "Foundry anchor for the global advanced-node semiconductor ecosystem and a core second-order read-through for AI and mobile winners.",
    peerSymbols: ["NVDA", "AAPL", "AMD", "ASML"],
    competitorSymbols: ["INTC", "Samsung"],
    relationships: [
      relation("ASML", "critical equipment supplier", "supply-chain", "EUV tool dependency", 5),
      relation("AAPL", "major customer", "customer", "Leading-edge mobile and device silicon", 5),
      relation("NVDA", "major customer", "customer", "AI accelerator fabrication", 5),
      relation("AMD", "major customer", "customer", "CPU and GPU production", 4),
      relation("QCOM", "customer", "customer", "Mobile and modem exposure", 3),
    ],
    corporate: [
      corporate("TSM", "subsidiary", "Advanced packaging", "CoWoS and packaging scale-up"),
    ],
    customerConcentration: [
      concentration("Leading-edge fabless customers", "High", "A small group of mega-cap designers drive the most strategic nodes."),
    ],
    executives: [
      executive("C.C. Wei", "CEO", ["TSMC"]),
    ],
    geography: {
      revenueMix: weights([
        ["US fabless demand", 5, "Largest strategic customer set"],
        ["Taiwan operations", 5, "Manufacturing concentration"],
        ["Global advanced-node exports", 4, "Cross-industry exposure"],
      ]),
      manufacturing: weights([
        ["Taiwan", 5, "Core fab footprint"],
        ["US", 2, "Emerging geographic diversification"],
        ["Japan", 2, "Regional diversification"],
      ]),
      supplyRegions: weights([
        ["Netherlands", 4, "Lithography dependence"],
        ["Japan", 3, "Materials / equipment"],
        ["US", 3, "Design customer base"],
      ]),
    },
    ecosystems: [
      ecosystem("Advanced semiconductor manufacturing", ["Equipment", "Foundry", "Packaging", "Fabless customers"]),
    ],
    eventChains: [
      impact("AI demand surprise", ["Foundry utilization tightens", "Equipment vendors rerate", "Fabless customer lead times matter"]),
      impact("Taiwan disruption", ["Global AI and smartphone supply chains react immediately"]),
    ],
  },
  ASML: {
    headline: "Semiconductor equipment choke-point whose outlook often acts as a pure-play read-through on foundry expansion and advanced-node capacity.",
    peerSymbols: ["TSM", "NVDA", "AMD", "INTC"],
    competitorSymbols: ["TSM", "INTC"],
    relationships: [
      relation("TSM", "customer", "customer", "Advanced-node foundry capex", 5),
      relation("INTC", "customer", "customer", "Foundry and process rebuild capex", 4),
      relation("Samsung", "customer", "customer", "Leading-edge logic capex", 4),
      relation("NVDA", "second-order beneficiary", "ecosystem", "AI demand feeds foundry tool demand", 4),
      relation("AAPL", "second-order beneficiary", "ecosystem", "Mobile leading-edge demand feeds tool demand", 3),
    ],
    corporate: [],
    customerConcentration: [
      concentration("Leading-edge foundries", "High", "A small set of strategic customers drive the most valuable demand."),
    ],
    executives: [
      executive("Christophe Fouquet", "CEO", ["ASML"]),
    ],
    geography: {
      revenueMix: weights([
        ["Taiwan / Korea / US foundries", 5, "Leading-edge demand centers"],
        ["Europe", 2, "Support and ecosystem footprint"],
      ]),
      manufacturing: weights([
        ["Netherlands", 5, "Core design and assembly center"],
      ]),
      supplyRegions: weights([
        ["Europe", 4, "Tool design and precision supply chain"],
        ["Global foundry markets", 4, "Installed base and service network"],
      ]),
    },
    ecosystems: [
      ecosystem("Semiconductor capital equipment", ["Precision components", "Tool assembly", "Foundry capex"]),
    ],
    eventChains: [
      impact("Foundry capex upgrade", ["ASML backlog confidence improves", "Second-order semiconductor equipment basket moves"]),
    ],
  },
  JPM: {
    headline: "Systemically important bank with broad consumer, corporate, markets, and payments exposure that often acts as a macro read-through on credit and deal activity.",
    peerSymbols: ["BAC", "GS", "MSFT", "V"],
    competitorSymbols: ["BAC", "GS"],
    relationships: [
      relation("BAC", "money-center competitor", "competition", "Consumer and corporate banking competition", 4),
      relation("GS", "markets competitor", "competition", "Investment banking and markets competition", 4),
      relation("V", "payments ecosystem", "ecosystem", "Card network and payments growth linkages", 3),
      relation("MA", "payments ecosystem", "ecosystem", "Card network and payments growth linkages", 3),
      relation("BROKERS", "distribution channel", "customer", "Advisor and wealth channels", 3),
    ],
    corporate: [
      corporate("JPM", "subsidiary", "Commercial & Investment Bank", "Markets and advisory"),
      corporate("JPM", "subsidiary", "Asset & Wealth Management", "Client assets and advisory"),
    ],
    customerConcentration: [
      concentration("Consumer deposits", "Broad", "Very diversified retail base."),
      concentration("Corporate / institutional clients", "High-value", "Large client relationships matter more than single-customer concentration."),
    ],
    executives: [
      executive("Jamie Dimon", "CEO", ["JPMorgan", "Citigroup", "American Express"]),
    ],
    geography: {
      revenueMix: weights([
        ["US consumer / corporate", 5, "Core earnings driver"],
        ["Global markets", 4, "Trading and investment bank footprint"],
      ]),
      manufacturing: weights([
        ["US banking footprint", 5, "Branch, card, and corporate banking base"],
      ]),
      supplyRegions: weights([
        ["US", 5, "Primary exposure"],
        ["Global financial centers", 3, "Markets and investment banking footprint"],
      ]),
    },
    ecosystems: [
      ecosystem("Financial intermediation", ["Deposits", "Credit", "Markets", "Payments", "Wealth"]),
    ],
    eventChains: [
      impact("Steeper yield curve", ["NII narrative improves", "Money-center bank basket responds", "Credit risk remains the offset"]),
      impact("Capital markets rebound", ["Advisory and underwriting improve", "Broker-dealer ecosystem strengthens"]),
    ],
  },
  XOM: {
    headline: "Integrated energy major with upstream commodity exposure, refining, chemicals, and global project execution sensitivity.",
    peerSymbols: ["CVX", "SLB", "XLE", "WTI"],
    competitorSymbols: ["CVX"],
    relationships: [
      relation("SLB", "services supplier", "supply-chain", "Oilfield service and project execution exposure", 4),
      relation("CVX", "integrated major competitor", "competition", "Commodity and capital allocation competition", 4),
      relation("WMT", "end-demand proxy", "ecosystem", "Consumer and freight energy demand read-through", 1),
    ],
    corporate: [
      corporate("XOM", "acquisition", "Pioneer Natural Resources", "US shale scale expansion"),
      corporate("XOM", "subsidiary", "Chemicals", "Downstream and chemicals platform"),
    ],
    customerConcentration: [
      concentration("Global energy demand", "Broad", "Commodity exposure is diversified by market rather than named customers."),
      concentration("Industrial and transport demand", "Macro-linked", "Demand follows the global growth cycle."),
    ],
    executives: [
      executive("Darren Woods", "CEO", ["Exxon Mobil"]),
    ],
    geography: {
      revenueMix: weights([
        ["Upstream oil / gas", 5, "Commodity-linked earnings core"],
        ["Refining / chemicals", 3, "Downstream diversification"],
        ["Global projects", 4, "International production and LNG footprint"],
      ]),
      manufacturing: weights([
        ["US shale", 4, "High-impact supply growth area"],
        ["Global LNG / offshore", 4, "Long-cycle project exposure"],
      ]),
      supplyRegions: weights([
        ["North America", 4, "Shale and refining footprint"],
        ["Middle East / Guyana / global", 4, "Upstream reserve base"],
      ]),
    },
    ecosystems: [
      ecosystem("Energy chain", ["Exploration", "Services", "Production", "Refining", "End demand"]),
    ],
    eventChains: [
      impact("Oil price spike", ["Integrated majors re-rate", "Services names follow", "Transport-sensitive sectors feel pressure"]),
      impact("Refining margin compression", ["Downstream earnings fade", "Commodity producers diverge from refiners"]),
    ],
  },
  UNH: {
    headline: "Managed-care and health-services platform with payer, provider, pharmacy, and care-delivery linkages.",
    peerSymbols: ["HUM", "ELV", "MRK", "CVS"],
    competitorSymbols: ["HUM", "ELV"],
    relationships: [
      relation("HUM", "managed-care competitor", "competition", "Medicare Advantage and payer competition", 4),
      relation("ELV", "managed-care competitor", "competition", "Commercial and government payer competition", 4),
      relation("MRK", "pharma ecosystem", "ecosystem", "Drug-cost and utilization sensitivity", 2),
      relation("BROKERS", "distribution channel", "customer", "Employer, broker, and advisor distribution", 2),
    ],
    corporate: [
      corporate("UNH", "subsidiary", "Optum", "Services, pharmacy, and care delivery platform"),
    ],
    customerConcentration: [
      concentration("Employer / government members", "Broad", "Membership is diversified, but policy changes can reprice the whole book."),
      concentration("Healthcare services clients", "Growing", "Optum expands enterprise relationships."),
    ],
    executives: [
      executive("Andrew Witty", "CEO", ["UnitedHealth", "GlaxoSmithKline"]),
    ],
    geography: {
      revenueMix: weights([
        ["US managed care", 5, "Core payer business"],
        ["Health services", 4, "Optum diversification"],
      ]),
      manufacturing: weights([
        ["US care delivery network", 5, "Domestic regulatory and provider exposure"],
      ]),
      supplyRegions: weights([
        ["US", 5, "Predominantly domestic healthcare system exposure"],
      ]),
    },
    ecosystems: [
      ecosystem("Healthcare financing", ["Members", "Providers", "Pharmacy", "Care delivery", "Regulation"]),
    ],
    eventChains: [
      impact("Medical cost trend rises", ["Managed-care margins compress", "Provider and pharma dynamics matter more", "Peer insurers trade lower"]),
      impact("Medicare Advantage policy support", ["Payer sentiment improves", "Services and enrollment narratives strengthen"]),
    ],
  },
};

export function listSupportedIntelligenceSymbols() {
  return Object.keys(GRAPH_BY_SYMBOL).map((symbol) => ({
    symbol,
    label: ENTITY_DIRECTORY[symbol]?.label ?? symbol,
  }));
}

export function getCuratedIntelligence(symbol) {
  const normalized = String(symbol ?? "").trim().toUpperCase();
  const entry = GRAPH_BY_SYMBOL[normalized];
  if (!entry) {
    return fallbackIntelligence(normalized);
  }

  const graph = buildGraph(normalized, entry);
  return {
    symbol: normalized,
    companyName: ENTITY_DIRECTORY[normalized]?.label ?? normalized,
    headline: entry.headline,
    curated: true,
    coverageNotes: entry.coverageNotes ?? [],
    supplyChain: filterRelationships(entry.relationships, ["supply-chain"]),
    customers: filterRelationships(entry.relationships, ["customer"]),
    corporateRelations: filterRelationships(entry.relationships, ["corporate", "investment"]),
    competitorRelations: filterRelationships(entry.relationships, ["competition"]),
    ecosystemRelations: filterRelationships(entry.relationships, ["ecosystem"]),
    relationships: entry.relationships,
    corporate: entry.corporate ?? [],
    customerConcentration: entry.customerConcentration ?? [],
    executives: entry.executives ?? [],
    geography: entry.geography ?? { revenueMix: [], manufacturing: [], supplyRegions: [] },
    ecosystems: entry.ecosystems ?? [],
    eventChains: entry.eventChains ?? [],
    peerSymbols: entry.peerSymbols ?? [],
    competitorSymbols: entry.competitorSymbols ?? [],
    graph,
  };
}

function fallbackIntelligence(symbol) {
  const node = ENTITY_DIRECTORY[symbol] ?? { id: symbol, label: symbol, kind: "issuer", symbol };
  return {
    symbol,
    companyName: node.label,
    headline: "No curated relationship graph is installed for this symbol yet.",
    curated: false,
    coverageNotes: [
      "Ownership, officers, and filing signals can still come from public sources.",
      "Supply-chain, corporate-tree, and ecosystem views require either curated mappings or licensed data.",
    ],
    supplyChain: [],
    customers: [],
    corporateRelations: [],
    competitorRelations: [],
    ecosystemRelations: [],
    relationships: [],
    corporate: [],
    customerConcentration: [],
    executives: [],
    geography: { revenueMix: [], manufacturing: [], supplyRegions: [] },
    ecosystems: [],
    eventChains: [],
    peerSymbols: [],
    competitorSymbols: [],
    graph: {
      nodes: [node],
      edges: [],
    },
  };
}

function buildGraph(symbol, entry) {
  const nodes = new Map();
  const edges = [];
  const rootNode = ENTITY_DIRECTORY[symbol] ?? { id: symbol, label: symbol, kind: "issuer", symbol };
  nodes.set(rootNode.id, rootNode);

  for (const item of entry.relationships ?? []) {
    const target = ENTITY_DIRECTORY[item.target] ?? {
      id: item.target,
      label: item.target,
      kind: item.domain,
      symbol: item.target.length <= 5 ? item.target : null,
    };
    nodes.set(target.id, target);
    edges.push({
      source: symbol,
      target: target.id,
      relation: item.relation,
      domain: item.domain,
      label: item.label,
      weight: item.weight,
    });
  }

  for (const item of entry.corporate ?? []) {
    const target = ENTITY_DIRECTORY[item.name.toUpperCase().replaceAll(/[^A-Z0-9]/g, "")] ?? {
      id: item.name,
      label: item.name,
      kind: item.type,
    };
    nodes.set(target.id, target);
    edges.push({
      source: symbol,
      target: target.id,
      relation: item.type,
      domain: "corporate",
      label: item.description,
      weight: 3,
    });
  }

  return {
    nodes: [...nodes.values()],
    edges,
  };
}

function filterRelationships(relationships, domains) {
  return (relationships ?? []).filter((item) => domains.includes(item.domain));
}

function relation(target, relationLabel, domain, label, weight) {
  return {
    target,
    relation: relationLabel,
    domain,
    label,
    weight,
  };
}

function corporate(root, type, name, description) {
  return {
    root,
    type,
    name,
    description,
  };
}

function concentration(name, level, commentary) {
  return {
    name,
    level,
    commentary,
  };
}

function executive(name, role, background) {
  return {
    name,
    role,
    background,
  };
}

function ecosystem(name, stages) {
  return {
    name,
    stages,
  };
}

function impact(title, steps) {
  return {
    title,
    steps,
  };
}

function weights(items) {
  return items.map(([label, weight, commentary]) => ({
    label,
    weight,
    commentary,
  }));
}
