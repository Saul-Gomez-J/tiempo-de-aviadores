import type { CollectionConfig } from 'payload'
import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { revalidatePostSitemap, revalidatePostDelete } from './hooks/revalidateSitemap'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePostSitemap],
    afterDelete: [revalidatePostDelete],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'category', 'status', 'publishedDate'],
    livePreview: {
      url: ({ data }) => {
        return `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/draft?slug=${data.slug}&secret=${process.env.PAYLOAD_SECRET}`
      },
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (e.g. my-post-title)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 160,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          EXPERIMENTAL_TableFeature(),
          BlocksFeature({
            blocks: [],
          }),
        ],
      }),
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mediaType: { equals: 'image' },
      },
    },
    {
      name: 'audio',
      type: 'upload',
      relationTo: 'media',
      required: false,
      filterOptions: {
        mediaType: { equals: 'audio' },
      },
      admin: {
        description: 'Audio version of the post (MP3)',
      },
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      required: false,
      filterOptions: {
        mediaType: { equals: 'video' },
      },
      admin: {
        description: 'Video version of the post',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'readTime',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Publication date of the article',
      },
      hooks: {
        beforeChange: [
          ({ value, data, operation }) => {
            if (!value && data?.status === 'published' && operation === 'create') {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
  ],
  timestamps: true,
}
