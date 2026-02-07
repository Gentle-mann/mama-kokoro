import { GoogleGenerativeAI } from '@google/generative-ai';

interface LocationResult {
  name: string;
  address: string;
  placeId?: string;
  rating?: number;
  types: string[];
  vicinity?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface LocationResponse {
  locations: LocationResult[];
  mapUrl?: string;
  searchQuery: string;
  category: string;
}

class LocationService {
  private googleApiKey: string;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.googleApiKey = process.env.GOOGLE_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(this.googleApiKey);
  }

  /**
   * Detect if a message contains location-based queries
   */
  isLocationQuery(message: string): boolean {
    const locationKeywords = [
      'where', 'nearest', 'closest', 'near me', 'nearby', 'location', 'address',
      'find', 'directions', 'map', 'around', 'close to', 'in tokyo', 'in osaka',
      'in kyoto', 'in shibuya', 'in shinjuku', 'in harajuku', 'どこ', '近く'
    ];

    const lowerMessage = message.toLowerCase();
    return locationKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Extract location intent and place type from user message
   */
  async extractLocationIntent(message: string): Promise<{
    placeType: string;
    location: string;
    intent: string;
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Analyze this message and extract location information:
      "${message}"
      
      Return a JSON object with:
      - placeType: what type of place they're looking for (bank, hospital, city hall, convenience store, etc.)
      - location: the area/city they mentioned (Tokyo, Shibuya, etc.) or "user_location" if not specified
      - intent: what they want to do (find, get directions, learn about, etc.)
      
      Example: "Where is the nearest bank in Shibuya?" 
      Response: {"placeType": "bank", "location": "Shibuya", "intent": "find"}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch {
        // Fallback parsing
        return this.fallbackLocationParsing(message);
      }
    } catch (error) {
      console.error('Location intent extraction error:', error);
      return this.fallbackLocationParsing(message);
    }
  }

  /**
   * Fallback method to parse location queries without AI
   */
  private fallbackLocationParsing(message: string): {
    placeType: string;
    location: string;
    intent: string;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Common place types
    let placeType = 'general';
    if (lowerMessage.includes('bank')) placeType = 'bank';
    else if (lowerMessage.includes('hospital') || lowerMessage.includes('clinic')) placeType = 'hospital';
    else if (lowerMessage.includes('city hall') || lowerMessage.includes('ward office')) placeType = 'city_hall';
    else if (lowerMessage.includes('convenience store') || lowerMessage.includes('conbini')) placeType = 'convenience_store';
    else if (lowerMessage.includes('pharmacy')) placeType = 'pharmacy';
    else if (lowerMessage.includes('post office')) placeType = 'post_office';
    else if (lowerMessage.includes('restaurant')) placeType = 'restaurant';
    else if (lowerMessage.includes('supermarket') || lowerMessage.includes('grocery')) placeType = 'supermarket';

    // Common locations in Japan
    let location = 'user_location';
    const locations = ['tokyo', 'osaka', 'kyoto', 'shibuya', 'shinjuku', 'harajuku', 'ginza', 'akihabara'];
    for (const loc of locations) {
      if (lowerMessage.includes(loc)) {
        location = loc;
        break;
      }
    }

    const intent = lowerMessage.includes('direction') ? 'directions' : 'find';

    return { placeType, location, intent };
  }

  /**
   * Generate location-aware response with helpful information
   */
  async generateLocationResponse(
    placeType: string,
    location: string,
    intent: string,
    originalMessage: string
  ): Promise<LocationResponse> {
    // Mock location data for common places in Japan
    const mockLocations = this.getMockLocationData(placeType, location);
    
    // Generate a helpful response with location context
    const searchQuery = `${placeType} in ${location === 'user_location' ? 'your area' : location}`;
    
    return {
      locations: mockLocations,
      searchQuery,
      category: this.mapPlaceTypeToCategory(placeType),
      mapUrl: this.generateMapUrl(placeType, location)
    };
  }

  /**
   * Get mock location data for common places
   */
  private getMockLocationData(placeType: string, location: string): LocationResult[] {
    const locationData: { [key: string]: { [key: string]: LocationResult[] } } = {
      bank: {
        shibuya: [
          {
            name: 'MUFG Bank Shibuya Branch',
            address: '2-20-15 Shibuya, Shibuya City, Tokyo',
            rating: 4.2,
            types: ['bank', 'finance'],
            vicinity: 'Near Shibuya Station',
            geometry: { location: { lat: 35.6598, lng: 139.7006 } }
          },
          {
            name: 'Mizuho Bank Shibuya Branch',
            address: '3-24-17 Shibuya, Shibuya City, Tokyo',
            rating: 4.0,
            types: ['bank', 'finance'],
            vicinity: 'Shibuya Center',
            geometry: { location: { lat: 35.6612, lng: 139.7019 } }
          }
        ],
        tokyo: [
          {
            name: 'Japan Post Bank Tokyo Station',
            address: '1-9-1 Marunouchi, Chiyoda City, Tokyo',
            rating: 4.3,
            types: ['bank', 'post_office'],
            vicinity: 'Tokyo Station',
            geometry: { location: { lat: 35.6812, lng: 139.7671 } }
          }
        ]
      },
      city_hall: {
        shibuya: [
          {
            name: 'Shibuya City Office',
            address: '2-21-1 Shibuya, Shibuya City, Tokyo 150-8010',
            rating: 3.8,
            types: ['local_government_office'],
            vicinity: 'Shibuya',
            geometry: { location: { lat: 35.6627, lng: 139.6989 } }
          }
        ],
        tokyo: [
          {
            name: 'Tokyo Metropolitan Government Building',
            address: '2-8-1 Nishi-Shinjuku, Shinjuku City, Tokyo',
            rating: 4.1,
            types: ['local_government_office'],
            vicinity: 'Shinjuku',
            geometry: { location: { lat: 35.6896, lng: 139.6917 } }
          }
        ]
      },
      hospital: {
        shibuya: [
          {
            name: 'Shibuya Hospital',
            address: '8-16 Higashi, Shibuya City, Tokyo',
            rating: 4.0,
            types: ['hospital'],
            vicinity: 'Shibuya East',
            geometry: { location: { lat: 35.6580, lng: 139.7016 } }
          }
        ]
      }
    };

    const normalizedLocation = location.toLowerCase();
    const data = locationData[placeType]?.[normalizedLocation] || locationData[placeType]?.['tokyo'] || [];
    
    // If no specific data, return generic helpful information
    if (data.length === 0) {
      return [{
        name: `${placeType.replace('_', ' ')} locations`,
        address: `Available throughout ${location === 'user_location' ? 'Japan' : location}`,
        types: [placeType],
        vicinity: location === 'user_location' ? 'Your area' : location
      }];
    }

    return data;
  }

  /**
   * Map place types to ByteFriend categories
   */
  private mapPlaceTypeToCategory(placeType: string): string {
    const categoryMap: { [key: string]: string } = {
      'bank': 'banking',
      'city_hall': 'city-hall',
      'hospital': 'healthcare',
      'clinic': 'healthcare',
      'pharmacy': 'healthcare',
      'convenience_store': 'living',
      'supermarket': 'living',
      'restaurant': 'food',
      'post_office': 'city-hall'
    };

    return categoryMap[placeType] || 'general';
  }

  /**
   * Generate Google Maps URL for the search
   */
  private generateMapUrl(placeType: string, location: string): string {
    const query = encodeURIComponent(`${placeType.replace('_', ' ')} ${location}`);
    return `https://www.google.com/maps/search/${query}`;
  }

  /**
   * Generate location-aware guidance text
   */
  generateLocationGuidance(placeType: string, location: string, locations: LocationResult[]): string {
    const placeTypeDisplay = placeType.replace('_', ' ');
    const locationDisplay = location === 'user_location' ? 'your area' : location;

    let guidance = `🗺️ **Finding ${placeTypeDisplay} in ${locationDisplay}**\n\n`;

    if (locations.length > 0 && locations[0].address !== `Available throughout ${location === 'user_location' ? 'Japan' : location}`) {
      guidance += `**Recommended locations:**\n`;
      locations.forEach((loc, index) => {
        guidance += `${index + 1}. **${loc.name}**\n`;
        guidance += `   📍 ${loc.address}\n`;
        if (loc.rating) {
          guidance += `   ⭐ ${loc.rating}/5.0\n`;
        }
        if (loc.vicinity) {
          guidance += `   📍 ${loc.vicinity}\n`;
        }
        guidance += `\n`;
      });
    }

    // Add specific guidance based on place type
    switch (placeType) {
      case 'bank':
        guidance += `💡 **Banking Tips:**\n`;
        guidance += `• Bring your residence card and passport\n`;
        guidance += `• Some banks require an appointment for foreigners\n`;
        guidance += `• Consider Japan Post Bank for easier account opening\n`;
        guidance += `• Most banks close at 3 PM on weekdays\n\n`;
        break;
      
      case 'city_hall':
        guidance += `💡 **City Hall Tips:**\n`;
        guidance += `• Bring all required documents and copies\n`;
        guidance += `• Office hours: Usually 8:30 AM - 5:15 PM, weekdays only\n`;
        guidance += `• Some services available on weekends at satellite offices\n`;
        guidance += `• Take a number when you arrive\n\n`;
        break;
      
      case 'hospital':
        guidance += `💡 **Healthcare Tips:**\n`;
        guidance += `• Bring your health insurance card\n`;
        guidance += `• Many hospitals require appointments\n`;
        guidance += `• Some hospitals have English-speaking staff\n`;
        guidance += `• Emergency: Call 119 for ambulance\n\n`;
        break;
    }

    guidance += `🗾 **Navigation Tips:**\n`;
    guidance += `• Use Google Maps or Hyperdia for directions\n`;
    guidance += `• Download offline maps before traveling\n`;
    guidance += `• Station names are usually in English too\n`;
    guidance += `• Ask station staff for help - they're very helpful!\n`;

    return guidance;
  }
}

export const locationService = new LocationService();