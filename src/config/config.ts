// src/config/index.ts

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file (if present)
dotenv.config();

// Define a schema for environment variables using zod for validation
const envSchema = z.object({
  NEXT_PUBLIC_BASE_PROMPT: z.string().optional(),
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1, { message: 'AZURE_STORAGE_CONNECTION_STRING is required' }),
  AZURE_TABLE_NAME: z.string().default('TravelAssociatesItineraryGenerationData'),
  DATABRICKS_HOST: z.string().min(1, { message: 'DATABRICKS_HOST is required' }),
  VECTOR_SEARCH_INDEX_NAME: z.string().min(1, { message: 'VECTOR_SEARCH_INDEX_NAME is required' }),
  LLAMA_ENDPOINT_URL: z.string().url({ message: 'LLAMA_ENDPOINT_URL must be a valid URL' }),
  NUM_VECTOR_RESULTS: z
    .string()
    .transform((val, ctx) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          expected: 'number',
          received: 'nan',
          message: 'NUM_VECTOR_RESULTS must be a number',
        });
        return z.NEVER;
      }
      return parsed;
    })
    .optional()
    .default('3'),
  // Add the Databricks API Token
  DATABRICKS_API_TOKEN: z.string().min(1, { message: 'DATABRICKS_API_TOKEN is required' }),
  // Add any additional environment variables here
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment variables. Please check your configuration.');
}

// Export the validated and parsed configuration
const config = {
  basePrompt: parsedEnv.data.NEXT_PUBLIC_BASE_PROMPT || '',
  azureStorageConnectionString: parsedEnv.data.AZURE_STORAGE_CONNECTION_STRING,
  azureTableName: parsedEnv.data.AZURE_TABLE_NAME,
  databricksHost: parsedEnv.data.DATABRICKS_HOST,
  vectorSearchIndexName: parsedEnv.data.VECTOR_SEARCH_INDEX_NAME,
  llamaEndpointUrl: parsedEnv.data.LLAMA_ENDPOINT_URL,
  numVectorResults: parsedEnv.data.NUM_VECTOR_RESULTS,
  databricksApiToken: parsedEnv.data.DATABRICKS_API_TOKEN, // Added Databricks API Token
  // Add any additional configuration here
};

export default config;
