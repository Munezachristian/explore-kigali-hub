# Information Centers Management Feature

## Overview

This feature provides a complete Tourism Information Center Management System that allows administrators to create and manage physical information centers with locations, media, and contact information. Tourists can view published centers and get directions.

## Features

### Admin Features (Dashboard)

1. **Create Information Center**
   - Name, description, address
   - GPS coordinates (latitude & longitude)
   - Contact information (phone, email)
   - Opening hours
   - Upload multiple images
   - Add video URLs (YouTube, Vimeo, etc.)
   - Publish/Unpublish toggle

2. **Edit Information Center**
   - Update all fields
   - Replace/delete media files
   - Update coordinates

3. **Delete Information Center**
   - Soft delete (status = deleted)
   - Confirmation dialog

4. **View All Centers**
   - Table layout with search and filter
   - Status filtering (Published/Unpublished)
   - Quick actions (View/Edit/Delete)

### User Side Features

1. **View List of Published Centers**
   - Search functionality
   - Grid layout with center cards
   - Quick access to directions

2. **Center Detail Page**
   - Full center information
   - Image gallery slider
   - Video section
   - Embedded Google Maps
   - "Get Directions" button
   - Contact information

## Database Schema

### `information_centers` Table

```sql
- id (UUID, Primary Key)
- name (VARCHAR(255), Required)
- description (TEXT)
- address (TEXT, Required)
- latitude (DECIMAL(10,8), Required)
- longitude (DECIMAL(11,8), Required)
- phone (VARCHAR(50))
- email (VARCHAR(255))
- opening_hours (TEXT)
- status (VARCHAR(20)) - 'published', 'unpublished', 'deleted'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (UUID, Foreign Key to auth.users)
```

### `information_center_media` Table

```sql
- id (UUID, Primary Key)
- information_center_id (UUID, Foreign Key)
- media_type (VARCHAR(20)) - 'image' or 'video'
- media_url (TEXT, Required)
- is_primary (BOOLEAN)
- display_order (INTEGER)
- created_at (TIMESTAMP)
```

## Setup Instructions

### 1. Database Migration

Run the migration file to create the tables:

```bash
# The migration file is located at:
supabase/migrations/20260221020000_create_information_centers.sql
```

This migration will:
- Create `information_centers` table
- Create `information_center_media` table
- Set up storage bucket for media uploads
- Configure RLS policies
- Create indexes for performance

### 2. Environment Variables

Add Google Maps API key to your `.env` file (optional, for embedded maps):

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Note:** The "Get Directions" button will work without the API key, but embedded maps require it.

### 3. Storage Bucket

The migration automatically creates a storage bucket named `information-center-media`. Ensure your Supabase project has storage enabled.

## Usage

### Admin Dashboard

1. Navigate to `/admin`
2. Click on "Information Centers" in the sidebar
3. Click "Create New Center" to add a new center
4. Fill in the required fields:
   - Name and Address are required
   - Set coordinates using Google Maps (right-click → coordinates)
   - Upload images or add video URLs
   - Set status to "Published" to make it visible to users

### Public Pages

1. **List Page**: Navigate to `/information-centers`
   - View all published centers
   - Search by name, address, or description
   - Click on a center card to view details

2. **Detail Page**: Navigate to `/information-centers/:id`
   - View full center information
   - Browse image gallery
   - Watch videos
   - View embedded map
   - Get directions via Google Maps

## API Endpoints

The feature uses Supabase client-side queries:

### Fetch Published Centers
```typescript
const { data } = await supabase
  .from('information_centers')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false });
```

### Fetch Center Media
```typescript
const { data } = await supabase
  .from('information_center_media')
  .select('*')
  .eq('information_center_id', centerId)
  .order('display_order', { ascending: true });
```

### Create Center
```typescript
const { data } = await supabase
  .from('information_centers')
  .insert({
    name: 'Center Name',
    address: 'Address',
    latitude: -1.9441,
    longitude: 30.0619,
    status: 'published',
    // ... other fields
  });
```

## File Structure

```
src/
├── components/
│   └── admin/
│       └── InformationCentersManager.tsx  # Admin CRUD component
├── pages/
│   ├── InformationCenters.tsx              # Public list page
│   └── InformationCenterDetail.tsx        # Public detail page
├── integrations/
│   └── supabase/
│       └── types.ts                        # Updated with new table types
└── supabase/
    └── migrations/
        └── 20260221020000_create_information_centers.sql
```

## Security

- **RLS Policies**: Row Level Security is enabled
- **Public Access**: Only published centers are visible to public users
- **Admin Access**: Only users with 'admin' role can create/edit/delete centers
- **Storage**: Media uploads are restricted to admin users

## Map Integration

### Google Maps Directions

The "Get Directions" button uses Google Maps Directions API:

```
https://www.google.com/maps/dir/?api=1&destination=LAT,LNG
```

This opens Google Maps navigation in a new tab.

### Embedded Maps

Embedded maps require a Google Maps API key:

```html
<iframe
  src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${lat},${lng}&zoom=15`}
/>
```

## Media Handling

### Images
- Upload via file input
- Stored in Supabase Storage bucket `information-center-media`
- Automatically generates public URLs

### Videos
- Add via URL (YouTube, Vimeo, etc.)
- Automatically detects video type
- Embedded using iframe on detail page

## Best Practices

1. **Coordinates**: Always verify coordinates using Google Maps before saving
2. **Images**: Use high-quality images (recommended: 1920x1080 or similar)
3. **Videos**: Use YouTube or Vimeo URLs for best compatibility
4. **Status**: Keep centers as "unpublished" until all information is complete
5. **Media**: Set primary image as first upload (is_primary flag)

## Troubleshooting

### Maps not showing
- Check if `VITE_GOOGLE_MAPS_API_KEY` is set in `.env`
- Verify API key has Maps Embed API enabled
- Check browser console for errors

### Images not uploading
- Verify storage bucket exists: `information-center-media`
- Check RLS policies allow admin uploads
- Check file size limits (Supabase default: 50MB)

### Centers not appearing
- Verify status is set to "published"
- Check RLS policies allow public read access
- Ensure migration ran successfully

## Future Enhancements

Potential improvements:
- Bulk import from CSV
- Advanced filtering (by location radius)
- Center categories/tags
- Reviews/ratings for centers
- Analytics dashboard
- Multi-language support
- Mobile app integration
