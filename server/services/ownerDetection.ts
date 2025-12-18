/**
 * Owner Detection Service
 * 
 * Detects property owners from public records (county assessor, Regrid API)
 * and provides contact information for outreach.
 */

export interface OwnerInfo {
  name: string;
  mailingAddress?: string;
  email?: string;
  phone?: string;
  dataSource: string;
  confidence: "high" | "medium" | "low";
  lastUpdated: Date;
}

export interface PropertyLookupResult {
  success: boolean;
  owner?: OwnerInfo;
  parcelId?: string;
  propertyAddress?: string;
  legalDescription?: string;
  assessedValue?: number;
  landUse?: string;
  acreage?: number;
  error?: string;
}

// Simulated county assessor data for demo purposes
// In production, this would call real APIs like Regrid, Attom, or county GIS
const MOCK_PROPERTY_DATABASE: Record<string, PropertyLookupResult> = {
  // Cherokee County, GA examples
  "123 main st, canton, ga": {
    success: true,
    parcelId: "15N04-0001-0234",
    propertyAddress: "123 Main St, Canton, GA 30114",
    owner: {
      name: "Smith Family Trust",
      mailingAddress: "456 Oak Lane, Canton, GA 30114",
      dataSource: "Cherokee County Assessor",
      confidence: "high",
      lastUpdated: new Date(),
    },
    legalDescription: "LOT 234 BLOCK A DOWNTOWN CANTON",
    assessedValue: 125000,
    landUse: "Vacant Commercial",
    acreage: 0.5,
  },
  "250 e main st, canton, ga": {
    success: true,
    parcelId: "15N04-0002-0100",
    propertyAddress: "250 E Main St, Canton, GA 30114",
    owner: {
      name: "Cherokee County",
      mailingAddress: "90 North St, Canton, GA 30114",
      email: "properties@cherokeega.com",
      dataSource: "Cherokee County Assessor",
      confidence: "high",
      lastUpdated: new Date(),
    },
    legalDescription: "LOT 100 HISTORIC DOWNTOWN",
    assessedValue: 450000,
    landUse: "Government/Institutional",
    acreage: 1.2,
  },
};

/**
 * Normalize address for lookup
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/,\s*/g, ", ")
    .replace(/\bstreet\b/gi, "st")
    .replace(/\bavenue\b/gi, "ave")
    .replace(/\bdrive\b/gi, "dr")
    .replace(/\broad\b/gi, "rd")
    .replace(/\bboulevard\b/gi, "blvd")
    .replace(/\bnorth\b/gi, "n")
    .replace(/\bsouth\b/gi, "s")
    .replace(/\beast\b/gi, "e")
    .replace(/\bwest\b/gi, "w")
    .trim();
}

/**
 * Look up property owner from coordinates using reverse geocoding + assessor records
 */
export async function lookupOwnerByCoordinates(
  latitude: number,
  longitude: number
): Promise<PropertyLookupResult> {
  // In production, this would:
  // 1. Call Regrid API with lat/lng to get parcel data
  // 2. Or call county GIS API for parcel lookup
  // 3. Then fetch owner info from assessor records
  
  console.log(`[OwnerDetection] Looking up owner at coordinates: ${latitude}, ${longitude}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo, return a simulated result based on coordinates
  // Cherokee County, GA approximate bounds: 34.1-34.4 lat, -84.6 to -84.2 lng
  if (latitude >= 34.1 && latitude <= 34.5 && longitude >= -84.7 && longitude <= -84.1) {
    return {
      success: true,
      parcelId: `CHK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      propertyAddress: `Property at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      owner: {
        name: "Property Owner (Lookup Pending)",
        dataSource: "Coordinate Lookup",
        confidence: "low",
        lastUpdated: new Date(),
      },
      landUse: "Unknown",
    };
  }
  
  // Generic result for other locations
  return {
    success: true,
    parcelId: `PARCEL-${Date.now()}`,
    propertyAddress: `Property at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    owner: {
      name: "Owner Information Pending",
      dataSource: "Coordinate Lookup",
      confidence: "low",
      lastUpdated: new Date(),
    },
  };
}

/**
 * Look up property owner by address
 */
export async function lookupOwnerByAddress(
  address: string,
  city: string,
  state: string
): Promise<PropertyLookupResult> {
  const fullAddress = `${address}, ${city}, ${state}`;
  const normalized = normalizeAddress(fullAddress);
  
  console.log(`[OwnerDetection] Looking up owner for: ${fullAddress}`);
  console.log(`[OwnerDetection] Normalized: ${normalized}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check mock database
  const mockResult = MOCK_PROPERTY_DATABASE[normalized];
  if (mockResult) {
    console.log(`[OwnerDetection] Found in mock database`);
    return mockResult;
  }
  
  // In production, call real APIs here:
  // Option 1: Regrid API (parcel data nationwide)
  // Option 2: County assessor API (varies by county)
  // Option 3: Attom Data (property data API)
  
  // Return a pending result for unknown addresses
  return {
    success: true,
    propertyAddress: fullAddress,
    owner: {
      name: "Owner Lookup In Progress",
      dataSource: "Address Lookup",
      confidence: "low",
      lastUpdated: new Date(),
    },
  };
}

/**
 * Generate a unique notification link for property owners
 */
export function generateOwnerNotificationLink(nominationId: string): string {
  const token = Buffer.from(`${nominationId}:${Date.now()}`).toString("base64url");
  return `/owner-response/${token}`;
}

/**
 * Validate and decode owner notification token
 */
export function decodeOwnerNotificationToken(token: string): { nominationId: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [nominationId, timestampStr] = decoded.split(":");
    const timestamp = parseInt(timestampStr, 10);
    
    if (!nominationId || isNaN(timestamp)) {
      return null;
    }
    
    // Token expires after 30 days
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > thirtyDaysMs) {
      return null;
    }
    
    return { nominationId, timestamp };
  } catch {
    return null;
  }
}

/**
 * Prepare owner outreach data
 */
export interface OwnerOutreach {
  nominationId: string;
  ownerName: string;
  propertyAddress: string;
  notificationLink: string;
  emailSubject: string;
  emailBody: string;
  smsMessage: string;
}

export function prepareOwnerOutreach(
  nominationId: string,
  ownerName: string,
  propertyAddress: string,
  communityUse: string,
  baseUrl: string
): OwnerOutreach {
  const notificationLink = `${baseUrl}${generateOwnerNotificationLink(nominationId)}`;
  
  const emailSubject = `Community Interest in Your Property at ${propertyAddress}`;
  
  const emailBody = `Dear ${ownerName},

We're reaching out on behalf of RevitaHub, a community-owned real estate revitalization platform.

Your property at ${propertyAddress} has been nominated by community members who would like to see it transformed into: ${communityUse}.

This is not a traditional real estate offer. Instead, we help communities pool resources through fractional ownership to revitalize properties and create lasting neighborhood assets.

If you're interested in learning more about how this works and the potential benefits:

Visit: ${notificationLink}

This link will show you:
- The community's vision for your property
- How the tokenization process works
- What fair market value offer could look like
- How you maintain input on the development

Thank you for considering this unique opportunity to be part of community-led revitalization.

Best regards,
The RevitaHub Team`;

  const smsMessage = `RevitaHub: Your property at ${propertyAddress} has community interest for ${communityUse}. Learn more: ${notificationLink}`;

  return {
    nominationId,
    ownerName,
    propertyAddress,
    notificationLink,
    emailSubject,
    emailBody,
    smsMessage,
  };
}
