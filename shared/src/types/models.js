"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.UserPreferencesSchema = exports.EventSchema = exports.ExtractedDataSchema = exports.SocialContentSchema = exports.MediaContentSchema = exports.ExtractionMetadataSchema = exports.EventDateTimeSchema = exports.OrganizerSchema = exports.PriceSchema = exports.LocationSchema = exports.CoordinatesSchema = exports.ExtractionConfidence = exports.UserRole = exports.InstagramContentType = exports.EventCategory = exports.EventType = exports.EventStatus = void 0;
const zod_1 = require("zod");
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "draft";
    EventStatus["PUBLISHED"] = "published";
    EventStatus["CANCELLED"] = "cancelled";
    EventStatus["POSTPONED"] = "postponed";
    EventStatus["COMPLETED"] = "completed";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
var EventType;
(function (EventType) {
    EventType["CONCERT"] = "concert";
    EventType["CONFERENCE"] = "conference";
    EventType["WORKSHOP"] = "workshop";
    EventType["PARTY"] = "party";
    EventType["EXHIBITION"] = "exhibition";
    EventType["SPORTS"] = "sports";
    EventType["NETWORKING"] = "networking";
    EventType["WEBINAR"] = "webinar";
    EventType["FESTIVAL"] = "festival";
    EventType["MEETUP"] = "meetup";
    EventType["OTHER"] = "other";
})(EventType || (exports.EventType = EventType = {}));
var EventCategory;
(function (EventCategory) {
    EventCategory["MUSIC"] = "music";
    EventCategory["TECHNOLOGY"] = "technology";
    EventCategory["BUSINESS"] = "business";
    EventCategory["ART_CULTURE"] = "art_culture";
    EventCategory["SPORTS_FITNESS"] = "sports_fitness";
    EventCategory["FOOD_DRINK"] = "food_drink";
    EventCategory["EDUCATION"] = "education";
    EventCategory["HEALTH_WELLNESS"] = "health_wellness";
    EventCategory["FASHION"] = "fashion";
    EventCategory["TRAVEL"] = "travel";
    EventCategory["OTHER"] = "other";
})(EventCategory || (exports.EventCategory = EventCategory = {}));
var InstagramContentType;
(function (InstagramContentType) {
    InstagramContentType["POST"] = "post";
    InstagramContentType["REEL"] = "reel";
    InstagramContentType["IGTV"] = "igtv";
    InstagramContentType["STORY"] = "story";
})(InstagramContentType || (exports.InstagramContentType = InstagramContentType = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
    UserRole["MODERATOR"] = "moderator";
})(UserRole || (exports.UserRole = UserRole = {}));
var ExtractionConfidence;
(function (ExtractionConfidence) {
    ExtractionConfidence["LOW"] = "low";
    ExtractionConfidence["MEDIUM"] = "medium";
    ExtractionConfidence["HIGH"] = "high";
    ExtractionConfidence["VERY_HIGH"] = "very_high";
})(ExtractionConfidence || (exports.ExtractionConfidence = ExtractionConfidence = {}));
exports.CoordinatesSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    accuracy: zod_1.z.number().optional()
});
exports.LocationSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1).max(255),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    zipCode: zod_1.z.string().optional(),
    coordinates: exports.CoordinatesSchema.optional(),
    placeId: zod_1.z.string().optional(),
    instagramLocationId: zod_1.z.string().optional()
});
exports.PriceSchema = zod_1.z.object({
    amount: zod_1.z.number().min(0),
    currency: zod_1.z.string().length(3),
    tier: zod_1.z.enum(['free', 'paid', 'donation', 'varies']).optional(),
    description: zod_1.z.string().optional()
});
exports.OrganizerSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1).max(255),
    instagramHandle: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    website: zod_1.z.string().url().optional(),
    verified: zod_1.z.boolean().default(false)
});
exports.EventDateTimeSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().optional(),
    startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: zod_1.z.string().default('UTC'),
    allDay: zod_1.z.boolean().default(false),
    recurring: zod_1.z.object({
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly', 'yearly']),
        interval: zod_1.z.number().min(1).default(1),
        endDate: zod_1.z.string().datetime().optional(),
        count: zod_1.z.number().min(1).optional()
    }).optional()
});
exports.ExtractionMetadataSchema = zod_1.z.object({
    extractedAt: zod_1.z.string().datetime(),
    processingTime: zod_1.z.number().min(0),
    instagramPostId: zod_1.z.string(),
    contentType: zod_1.z.nativeEnum(InstagramContentType),
    confidence: zod_1.z.number().min(0).max(1),
    confidenceLevel: zod_1.z.nativeEnum(ExtractionConfidence),
    extractorVersion: zod_1.z.string().default('1.0.0'),
    errors: zod_1.z.array(zod_1.z.string()).default([]),
    warnings: zod_1.z.array(zod_1.z.string()).default([])
});
exports.MediaContentSchema = zod_1.z.object({
    images: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().url(),
        alt: zod_1.z.string().optional(),
        width: zod_1.z.number().optional(),
        height: zod_1.z.number().optional(),
        size: zod_1.z.number().optional()
    })).default([]),
    videos: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().url(),
        thumbnail: zod_1.z.string().url().optional(),
        duration: zod_1.z.number().optional(),
        size: zod_1.z.number().optional()
    })).default([])
});
exports.SocialContentSchema = zod_1.z.object({
    hashtags: zod_1.z.array(zod_1.z.string()).default([]),
    mentions: zod_1.z.array(zod_1.z.string()).default([]),
    likes: zod_1.z.number().min(0).optional(),
    comments: zod_1.z.number().min(0).optional(),
    shares: zod_1.z.number().min(0).optional(),
    views: zod_1.z.number().min(0).optional()
});
exports.ExtractedDataSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    dateTime: exports.EventDateTimeSchema,
    location: exports.LocationSchema.optional(),
    type: zod_1.z.nativeEnum(EventType).optional(),
    category: zod_1.z.nativeEnum(EventCategory).optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    price: exports.PriceSchema.optional(),
    organizer: exports.OrganizerSchema.optional(),
    media: exports.MediaContentSchema.default({ images: [], videos: [] }),
    social: exports.SocialContentSchema.default({ hashtags: [], mentions: [] }),
    metadata: exports.ExtractionMetadataSchema,
    rawContent: zod_1.z.string(),
    originalUrl: zod_1.z.string().url()
});
exports.EventSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string().min(1).max(255),
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    summary: zod_1.z.string().max(500).optional(),
    dateTime: exports.EventDateTimeSchema,
    location: exports.LocationSchema.optional(),
    type: zod_1.z.nativeEnum(EventType).default(EventType.OTHER),
    category: zod_1.z.nativeEnum(EventCategory).default(EventCategory.OTHER),
    status: zod_1.z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    price: exports.PriceSchema.optional(),
    capacity: zod_1.z.number().min(0).optional(),
    registeredCount: zod_1.z.number().min(0).default(0),
    organizer: exports.OrganizerSchema.optional(),
    media: exports.MediaContentSchema.default({ images: [], videos: [] }),
    social: exports.SocialContentSchema.default({ hashtags: [], mentions: [] }),
    urls: zod_1.z.object({
        website: zod_1.z.string().url().optional(),
        tickets: zod_1.z.string().url().optional(),
        instagram: zod_1.z.string().url().optional(),
        facebook: zod_1.z.string().url().optional(),
        twitter: zod_1.z.string().url().optional()
    }).default({}),
    extractedData: exports.ExtractedDataSchema.optional(),
    isPublic: zod_1.z.boolean().default(true),
    isFeatured: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    createdBy: zod_1.z.string().uuid().optional(),
    lastModifiedBy: zod_1.z.string().uuid().optional()
});
exports.UserPreferencesSchema = zod_1.z.object({
    timezone: zod_1.z.string().default('UTC'),
    language: zod_1.z.string().length(2).default('en'),
    defaultCalendar: zod_1.z.string().optional(),
    notifications: zod_1.z.object({
        email: zod_1.z.boolean().default(true),
        push: zod_1.z.boolean().default(true),
        sms: zod_1.z.boolean().default(false)
    }).default({ email: true, push: true, sms: false }),
    eventCategories: zod_1.z.array(zod_1.z.nativeEnum(EventCategory)).default([]),
    autoSyncCalendar: zod_1.z.boolean().default(false)
});
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(50).optional(),
    firstName: zod_1.z.string().min(1).max(100).optional(),
    lastName: zod_1.z.string().min(1).max(100).optional(),
    displayName: zod_1.z.string().min(1).max(100).optional(),
    avatar: zod_1.z.string().url().optional(),
    role: zod_1.z.nativeEnum(UserRole).default(UserRole.USER),
    preferences: exports.UserPreferencesSchema.default({
        timezone: 'UTC',
        language: 'en',
        notifications: { email: true, push: true, sms: false },
        eventCategories: [],
        autoSyncCalendar: false
    }),
    isActive: zod_1.z.boolean().default(true),
    isVerified: zod_1.z.boolean().default(false),
    lastLoginAt: zod_1.z.string().datetime().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
//# sourceMappingURL=models.js.map