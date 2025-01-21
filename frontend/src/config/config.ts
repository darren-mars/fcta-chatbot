import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env.local
dotenv.config();

// Define a schema for environment variables using Zod for validation
const envSchema = z.object({
  // Public Variables
  NEXT_PUBLIC_BASE_PROMPT: z.string().optional(),
  NEXT_PUBLIC_LLAMA_ENDPOINT_URL: z.string().url({ message: 'Invalid LLAMA_ENDPOINT_URL' }),

  // Private Variables
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1, { message: 'AZURE_STORAGE_CONNECTION_STRING is required' }),
  AZURE_TABLE_NAME: z.string().default('TravelAssociatesItineraryGenerationData'),
  DATABRICKS_HOST: z.string().min(1, { message: 'DATABRICKS_HOST is required' }),
  VECTOR_SEARCH_INDEX_NAME: z.string().min(1, { message: 'VECTOR_SEARCH_INDEX_NAME is required' }),
  NUM_VECTOR_RESULTS: z.coerce
    .number()
    .int({ message: 'NUM_VECTOR_RESULTS must be an integer' })
    .positive({ message: 'NUM_VECTOR_RESULTS must be a positive number' })
    .optional()
    .default(3),
  DATABRICKS_API_TOKEN: z.string().min(1, { message: 'DATABRICKS_API_TOKEN is required' }),
  // Add any additional environment variables here
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment variables. Please check your configuration.');
}

// Define a TypeScript interface for configuration (optional but recommended)
interface Config {
  basePrompt: string;
  llamaEndpointUrl: string;
  azureStorageConnectionString: string;
  azureTableName: string;
  databricksHost: string;
  vectorSearchIndexName: string;
  numVectorResults: number;
  databricksApiToken: string;
}

// Export the validated and parsed configuration
const config: Config = {
  basePrompt: parsedEnv.data.NEXT_PUBLIC_BASE_PROMPT || '',
  llamaEndpointUrl: parsedEnv.data.NEXT_PUBLIC_LLAMA_ENDPOINT_URL,
  azureStorageConnectionString: parsedEnv.data.AZURE_STORAGE_CONNECTION_STRING,
  azureTableName: parsedEnv.data.AZURE_TABLE_NAME,
  databricksHost: parsedEnv.data.DATABRICKS_HOST,
  vectorSearchIndexName: parsedEnv.data.VECTOR_SEARCH_INDEX_NAME,
  numVectorResults: parsedEnv.data.NUM_VECTOR_RESULTS,
  databricksApiToken: parsedEnv.data.DATABRICKS_API_TOKEN,
};

export default config;
