import { MongoClient, Db, Collection } from 'mongodb';

interface MongoPrompt {
  _id?: string;
  id: string;
  title: string;
  description: string;
  assistant: string;
  task?: string;
  functionalArea?: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

class MongoService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<MongoPrompt> | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const connectionString = import.meta.env.VITE_MONGODB_CONNECTION_STRING;
      const databaseName = import.meta.env.VITE_MONGODB_DATABASE_NAME;
      const collectionName = import.meta.env.VITE_MONGODB_COLLECTION_NAME;

      if (!connectionString || !databaseName || !collectionName) {
        console.warn('MongoDB configuration missing in environment variables');
        return;
      }

      this.client = new MongoClient(connectionString);
      await this.client.connect();
      this.db = this.client.db(databaseName);
      this.collection = this.db.collection<MongoPrompt>(collectionName);
      this.isConnected = true;
      
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
    }
  }

  async getPrompts(): Promise<MongoPrompt[]> {
    if (!this.isConnected || !this.collection) {
      console.warn('MongoDB not connected, returning empty array');
      return [];
    }

    try {
      const prompts = await this.collection.find({}).toArray();
      return prompts.map(prompt => ({
        ...prompt,
        id: prompt.id || prompt._id?.toString() || ''
      }));
    } catch (error) {
      console.error('Error fetching prompts from MongoDB:', error);
      return [];
    }
  }

  async getPromptsByAssistant(assistant: string): Promise<MongoPrompt[]> {
    if (!this.isConnected || !this.collection) {
      return [];
    }

    try {
      const prompts = await this.collection.find({ assistant }).toArray();
      return prompts.map(prompt => ({
        ...prompt,
        id: prompt.id || prompt._id?.toString() || ''
      }));
    } catch (error) {
      console.error('Error fetching prompts by assistant from MongoDB:', error);
      return [];
    }
  }

  async searchPrompts(query: string): Promise<MongoPrompt[]> {
    if (!this.isConnected || !this.collection) {
      return [];
    }

    try {
      const searchRegex = new RegExp(query, 'i');
      const prompts = await this.collection.find({
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } }
        ]
      }).toArray();
      
      return prompts.map(prompt => ({
        ...prompt,
        id: prompt.id || prompt._id?.toString() || ''
      }));
    } catch (error) {
      console.error('Error searching prompts in MongoDB:', error);
      return [];
    }
  }

  async addPrompt(prompt: Omit<MongoPrompt, '_id'>): Promise<boolean> {
    if (!this.isConnected || !this.collection) {
      return false;
    }

    try {
      const promptWithTimestamp = {
        ...prompt,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await this.collection.insertOne(promptWithTimestamp);
      return true;
    } catch (error) {
      console.error('Error adding prompt to MongoDB:', error);
      return false;
    }
  }

  async updatePrompt(id: string, updates: Partial<MongoPrompt>): Promise<boolean> {
    if (!this.isConnected || !this.collection) {
      return false;
    }

    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      const result = await this.collection.updateOne(
        { $or: [{ id }, { _id: id }] },
        { $set: updateData }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating prompt in MongoDB:', error);
      return false;
    }
  }

  async deletePrompt(id: string): Promise<boolean> {
    if (!this.isConnected || !this.collection) {
      return false;
    }

    try {
      const result = await this.collection.deleteOne(
        { $or: [{ id }, { _id: id }] }
      );
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting prompt from MongoDB:', error);
      return false;
    }
  }

  isMongoConnected(): boolean {
    return this.isConnected;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      this.client = null;
      this.db = null;
      this.collection = null;
    }
  }
}

export const mongoService = new MongoService();
export type { MongoPrompt };