import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [Users, Authors, Categories, Media, Posts],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 5,
    },
    schemaName: 'payload',
  }),

  sharp,

  plugins: [
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title || ''} | Blog`,
      generateDescription: ({ doc }) => doc?.description || '',
      generateURL: ({ doc }) => {
        return `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/blog/${doc?.slug}`
      },
    }),
  ],
})
