import { z } from 'zod';
export declare enum EventStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    CANCELLED = "cancelled",
    POSTPONED = "postponed",
    COMPLETED = "completed"
}
export declare enum EventType {
    CONCERT = "concert",
    CONFERENCE = "conference",
    WORKSHOP = "workshop",
    PARTY = "party",
    EXHIBITION = "exhibition",
    SPORTS = "sports",
    NETWORKING = "networking",
    WEBINAR = "webinar",
    FESTIVAL = "festival",
    MEETUP = "meetup",
    OTHER = "other"
}
export declare enum EventCategory {
    MUSIC = "music",
    TECHNOLOGY = "technology",
    BUSINESS = "business",
    ART_CULTURE = "art_culture",
    SPORTS_FITNESS = "sports_fitness",
    FOOD_DRINK = "food_drink",
    EDUCATION = "education",
    HEALTH_WELLNESS = "health_wellness",
    FASHION = "fashion",
    TRAVEL = "travel",
    OTHER = "other"
}
export declare enum InstagramContentType {
    POST = "post",
    REEL = "reel",
    IGTV = "igtv",
    STORY = "story"
}
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    MODERATOR = "moderator"
}
export declare enum ExtractionConfidence {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
export declare const CoordinatesSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    accuracy: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const LocationSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    zipCode: z.ZodOptional<z.ZodString>;
    coordinates: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        accuracy: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    placeId: z.ZodOptional<z.ZodString>;
    instagramLocationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const PriceSchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodString;
    tier: z.ZodOptional<z.ZodEnum<{
        free: "free";
        paid: "paid";
        donation: "donation";
        varies: "varies";
    }>>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const OrganizerSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    instagramHandle: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    verified: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const EventDateTimeSchema: z.ZodObject<{
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    allDay: z.ZodDefault<z.ZodBoolean>;
    recurring: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<{
            daily: "daily";
            weekly: "weekly";
            monthly: "monthly";
            yearly: "yearly";
        }>;
        interval: z.ZodDefault<z.ZodNumber>;
        endDate: z.ZodOptional<z.ZodString>;
        count: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const ExtractionMetadataSchema: z.ZodObject<{
    extractedAt: z.ZodString;
    processingTime: z.ZodNumber;
    instagramPostId: z.ZodString;
    contentType: z.ZodEnum<typeof InstagramContentType>;
    confidence: z.ZodNumber;
    confidenceLevel: z.ZodEnum<typeof ExtractionConfidence>;
    extractorVersion: z.ZodDefault<z.ZodString>;
    errors: z.ZodDefault<z.ZodArray<z.ZodString>>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const MediaContentSchema: z.ZodObject<{
    images: z.ZodDefault<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        size: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    videos: z.ZodDefault<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        thumbnail: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        size: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const SocialContentSchema: z.ZodObject<{
    hashtags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    mentions: z.ZodDefault<z.ZodArray<z.ZodString>>;
    likes: z.ZodOptional<z.ZodNumber>;
    comments: z.ZodOptional<z.ZodNumber>;
    shares: z.ZodOptional<z.ZodNumber>;
    views: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ExtractedDataSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dateTime: z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        startTime: z.ZodOptional<z.ZodString>;
        endTime: z.ZodOptional<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        allDay: z.ZodDefault<z.ZodBoolean>;
        recurring: z.ZodOptional<z.ZodObject<{
            frequency: z.ZodEnum<{
                daily: "daily";
                weekly: "weekly";
                monthly: "monthly";
                yearly: "yearly";
            }>;
            interval: z.ZodDefault<z.ZodNumber>;
            endDate: z.ZodOptional<z.ZodString>;
            count: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    location: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        zipCode: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            accuracy: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        placeId: z.ZodOptional<z.ZodString>;
        instagramLocationId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    type: z.ZodOptional<z.ZodEnum<typeof EventType>>;
    category: z.ZodOptional<z.ZodEnum<typeof EventCategory>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    price: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
        tier: z.ZodOptional<z.ZodEnum<{
            free: "free";
            paid: "paid";
            donation: "donation";
            varies: "varies";
        }>>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    organizer: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        instagramHandle: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        verified: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    media: z.ZodDefault<z.ZodObject<{
        images: z.ZodDefault<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
            size: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        videos: z.ZodDefault<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            thumbnail: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodNumber>;
            size: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    social: z.ZodDefault<z.ZodObject<{
        hashtags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        mentions: z.ZodDefault<z.ZodArray<z.ZodString>>;
        likes: z.ZodOptional<z.ZodNumber>;
        comments: z.ZodOptional<z.ZodNumber>;
        shares: z.ZodOptional<z.ZodNumber>;
        views: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    metadata: z.ZodObject<{
        extractedAt: z.ZodString;
        processingTime: z.ZodNumber;
        instagramPostId: z.ZodString;
        contentType: z.ZodEnum<typeof InstagramContentType>;
        confidence: z.ZodNumber;
        confidenceLevel: z.ZodEnum<typeof ExtractionConfidence>;
        extractorVersion: z.ZodDefault<z.ZodString>;
        errors: z.ZodDefault<z.ZodArray<z.ZodString>>;
        warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    rawContent: z.ZodString;
    originalUrl: z.ZodString;
}, z.core.$strip>;
export declare const EventSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    dateTime: z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        startTime: z.ZodOptional<z.ZodString>;
        endTime: z.ZodOptional<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        allDay: z.ZodDefault<z.ZodBoolean>;
        recurring: z.ZodOptional<z.ZodObject<{
            frequency: z.ZodEnum<{
                daily: "daily";
                weekly: "weekly";
                monthly: "monthly";
                yearly: "yearly";
            }>;
            interval: z.ZodDefault<z.ZodNumber>;
            endDate: z.ZodOptional<z.ZodString>;
            count: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    location: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        zipCode: z.ZodOptional<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            accuracy: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        placeId: z.ZodOptional<z.ZodString>;
        instagramLocationId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    type: z.ZodDefault<z.ZodEnum<typeof EventType>>;
    category: z.ZodDefault<z.ZodEnum<typeof EventCategory>>;
    status: z.ZodDefault<z.ZodEnum<typeof EventStatus>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    price: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
        tier: z.ZodOptional<z.ZodEnum<{
            free: "free";
            paid: "paid";
            donation: "donation";
            varies: "varies";
        }>>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    capacity: z.ZodOptional<z.ZodNumber>;
    registeredCount: z.ZodDefault<z.ZodNumber>;
    organizer: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        instagramHandle: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        verified: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    media: z.ZodDefault<z.ZodObject<{
        images: z.ZodDefault<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            alt: z.ZodOptional<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
            size: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        videos: z.ZodDefault<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            thumbnail: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodNumber>;
            size: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    social: z.ZodDefault<z.ZodObject<{
        hashtags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        mentions: z.ZodDefault<z.ZodArray<z.ZodString>>;
        likes: z.ZodOptional<z.ZodNumber>;
        comments: z.ZodOptional<z.ZodNumber>;
        shares: z.ZodOptional<z.ZodNumber>;
        views: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    urls: z.ZodDefault<z.ZodObject<{
        website: z.ZodOptional<z.ZodString>;
        tickets: z.ZodOptional<z.ZodString>;
        instagram: z.ZodOptional<z.ZodString>;
        facebook: z.ZodOptional<z.ZodString>;
        twitter: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    extractedData: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        dateTime: z.ZodObject<{
            startDate: z.ZodString;
            endDate: z.ZodOptional<z.ZodString>;
            startTime: z.ZodOptional<z.ZodString>;
            endTime: z.ZodOptional<z.ZodString>;
            timezone: z.ZodDefault<z.ZodString>;
            allDay: z.ZodDefault<z.ZodBoolean>;
            recurring: z.ZodOptional<z.ZodObject<{
                frequency: z.ZodEnum<{
                    daily: "daily";
                    weekly: "weekly";
                    monthly: "monthly";
                    yearly: "yearly";
                }>;
                interval: z.ZodDefault<z.ZodNumber>;
                endDate: z.ZodOptional<z.ZodString>;
                count: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        location: z.ZodOptional<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            address: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            zipCode: z.ZodOptional<z.ZodString>;
            coordinates: z.ZodOptional<z.ZodObject<{
                latitude: z.ZodNumber;
                longitude: z.ZodNumber;
                accuracy: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            placeId: z.ZodOptional<z.ZodString>;
            instagramLocationId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        type: z.ZodOptional<z.ZodEnum<typeof EventType>>;
        category: z.ZodOptional<z.ZodEnum<typeof EventCategory>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        price: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
            tier: z.ZodOptional<z.ZodEnum<{
                free: "free";
                paid: "paid";
                donation: "donation";
                varies: "varies";
            }>>;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        organizer: z.ZodOptional<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            instagramHandle: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            website: z.ZodOptional<z.ZodString>;
            verified: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
        media: z.ZodDefault<z.ZodObject<{
            images: z.ZodDefault<z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                alt: z.ZodOptional<z.ZodString>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
                size: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>>;
            videos: z.ZodDefault<z.ZodArray<z.ZodObject<{
                url: z.ZodString;
                thumbnail: z.ZodOptional<z.ZodString>;
                duration: z.ZodOptional<z.ZodNumber>;
                size: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        social: z.ZodDefault<z.ZodObject<{
            hashtags: z.ZodDefault<z.ZodArray<z.ZodString>>;
            mentions: z.ZodDefault<z.ZodArray<z.ZodString>>;
            likes: z.ZodOptional<z.ZodNumber>;
            comments: z.ZodOptional<z.ZodNumber>;
            shares: z.ZodOptional<z.ZodNumber>;
            views: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        metadata: z.ZodObject<{
            extractedAt: z.ZodString;
            processingTime: z.ZodNumber;
            instagramPostId: z.ZodString;
            contentType: z.ZodEnum<typeof InstagramContentType>;
            confidence: z.ZodNumber;
            confidenceLevel: z.ZodEnum<typeof ExtractionConfidence>;
            extractorVersion: z.ZodDefault<z.ZodString>;
            errors: z.ZodDefault<z.ZodArray<z.ZodString>>;
            warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>;
        rawContent: z.ZodString;
        originalUrl: z.ZodString;
    }, z.core.$strip>>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    createdBy: z.ZodOptional<z.ZodString>;
    lastModifiedBy: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const UserPreferencesSchema: z.ZodObject<{
    timezone: z.ZodDefault<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    defaultCalendar: z.ZodOptional<z.ZodString>;
    notifications: z.ZodDefault<z.ZodObject<{
        email: z.ZodDefault<z.ZodBoolean>;
        push: z.ZodDefault<z.ZodBoolean>;
        sms: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    eventCategories: z.ZodDefault<z.ZodArray<z.ZodEnum<typeof EventCategory>>>;
    autoSyncCalendar: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<typeof UserRole>>;
    preferences: z.ZodDefault<z.ZodObject<{
        timezone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        defaultCalendar: z.ZodOptional<z.ZodString>;
        notifications: z.ZodDefault<z.ZodObject<{
            email: z.ZodDefault<z.ZodBoolean>;
            push: z.ZodDefault<z.ZodBoolean>;
            sms: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
        eventCategories: z.ZodDefault<z.ZodArray<z.ZodEnum<typeof EventCategory>>>;
        autoSyncCalendar: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    lastLoginAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Price = z.infer<typeof PriceSchema>;
export type Organizer = z.infer<typeof OrganizerSchema>;
export type EventDateTime = z.infer<typeof EventDateTimeSchema>;
export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;
export type MediaContent = z.infer<typeof MediaContentSchema>;
export type SocialContent = z.infer<typeof SocialContentSchema>;
export type ExtractedData = z.infer<typeof ExtractedDataSchema>;
export type Event = z.infer<typeof EventSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type User = z.infer<typeof UserSchema>;
export type EventCreateInput = Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'slug'>;
export type EventUpdateInput = Partial<Omit<Event, 'id' | 'createdAt' | 'slug'>>;
export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UserUpdateInput = Partial<Omit<User, 'id' | 'createdAt'>>;
export type EventFilters = {
    status?: EventStatus[];
    type?: EventType[];
    category?: EventCategory[];
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    organizer?: string;
    tags?: string[];
    isPublic?: boolean;
    isFeatured?: boolean;
};
export type EventSortOptions = {
    field: 'createdAt' | 'updatedAt' | 'startDate' | 'title' | 'registeredCount';
    direction: 'asc' | 'desc';
};
//# sourceMappingURL=models.d.ts.map