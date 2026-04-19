import type { CollectionConfig } from 'payload'
import { put } from '@vercel/blob'
import fs from 'fs/promises'
import path from 'path'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'featured',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'audio/*', 'video/*'],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.mimeType) {
          if (data.mimeType.startsWith('image/')) {
            data.mediaType = 'image'
          } else if (data.mimeType.startsWith('audio/')) {
            data.mediaType = 'audio'
          } else if (data.mimeType.startsWith('video/')) {
            data.mediaType = 'video'
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        if (!process.env.BLOB_READ_WRITE_TOKEN) return doc
        if (!doc.filename) return doc

        try {
          const uploadDir = path.resolve(process.cwd(), 'public/media')
          const originalPath = path.join(uploadDir, doc.filename)

          fs.readFile(originalPath).then(async (fileBuffer) => {
            await put(`blog/${doc.filename}`, fileBuffer, {
              access: 'public',
              contentType: doc.mimeType || 'application/octet-stream',
            })

            const isImage = doc.mimeType?.startsWith('image/')
            if (isImage && doc.sizes) {
              const uploads = Object.values(doc.sizes).map(async (sizeData) => {
                if (sizeData && typeof sizeData === 'object' && 'filename' in sizeData && sizeData.filename) {
                  const sizePath = path.join(uploadDir, sizeData.filename as string)
                  const sizeBuffer = await fs.readFile(sizePath)
                  await put(`blog/${sizeData.filename as string}`, sizeBuffer, {
                    access: 'public',
                    contentType: doc.mimeType || 'image/jpeg',
                  })
                }
              })
              await Promise.all(uploads)
            }
          }).catch((error) => {
            console.error('Error uploading to Vercel Blob:', error)
          })
        } catch (error) {
          console.error('Error in upload process:', error)
        }

        return doc
      },
    ],
    afterRead: [
      async ({ doc }) => {
        if (!doc) return doc

        if (process.env.BLOB_READ_WRITE_TOKEN && doc.filename) {
          const tokenParts = process.env.BLOB_READ_WRITE_TOKEN.split('_')
          const blobId = tokenParts[tokenParts.length - 2].toLowerCase()

          const blobBase = `https://${blobId}.public.blob.vercel-storage.com/blog`
          doc.url = `${blobBase}/${doc.filename}`

          const isImage = doc.mimeType?.startsWith('image/')

          if (isImage && doc.thumbnailURL) {
            const thumbFilename = doc.filename.replace(/(\.[^.]+)$/, '-400x300$1')
            doc.thumbnailURL = `${blobBase}/${thumbFilename}`
          }

          if (isImage && doc.sizes) {
            for (const sizeName of Object.keys(doc.sizes)) {
              if (doc.sizes[sizeName]?.filename) {
                doc.sizes[sizeName].url = `${blobBase}/${doc.sizes[sizeName].filename}`
              }
            }
          }
        } else {
          if (doc.url && doc.url.startsWith('/api/media/file/')) {
            doc.url = doc.url.replace('/api/media/file/', '/media/')
            if (doc.thumbnailURL) {
              doc.thumbnailURL = doc.thumbnailURL.replace('/api/media/file/', '/media/')
            }
            if (doc.sizes) {
              for (const sizeName of Object.keys(doc.sizes)) {
                if (doc.sizes[sizeName]?.url) {
                  doc.sizes[sizeName].url = doc.sizes[sizeName].url.replace('/api/media/file/', '/media/')
                }
              }
            }
          }
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'mediaType',
      type: 'select',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Audio', value: 'audio' },
        { label: 'Video', value: 'video' },
      ],
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'alt',
      type: 'text',
      validate: (value: string | null | undefined, { data }: { data: Record<string, unknown> }) => {
        if (data?.mimeType && typeof data.mimeType === 'string' && data.mimeType.startsWith('image/') && !value) {
          return 'Alt text is required for images'
        }
        return true
      },
    },
  ],
}
