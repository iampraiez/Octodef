import { getCollections } from "@/lib/db";
import { DefenseResult } from "@/types/types";

/**
 * Save a defense result to the database
 */
export async function saveDefenseResult(
  result: Omit<DefenseResult, "_id">,
  userFingerprint?: string,
  ip?: string,
  userAgent?: string
): Promise<string> {
  try {
    const { defenseResultCollection } = await getCollections();
    
    const insertResult = await defenseResultCollection.insertOne({
      ...result,
      userFingerprint,
      ip,
      userAgent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return insertResult.insertedId.toString();
  } catch (error) {
    console.error("Failed to save defense result:", error);
    throw new Error("Database error: Failed to save result");
  }
}

/**
 * Get defense results for a specific user fingerprint
 */
export async function getDefenseResults(
  fingerprint: string
): Promise<DefenseResult[]> {
  try {
    const { defenseResultCollection } = await getCollections();
    
    const results = await defenseResultCollection
      .find({ userFingerprint: fingerprint })
      .sort({ timestamp: -1 })
      .toArray();
    
    return results as DefenseResult[];
  } catch (error) {
    console.error("Failed to fetch defense results:", error);
    throw new Error("Database error: Failed to fetch results");
  }
}

/**
 * Delete defense results by IDs for a specific user
 */
export async function deleteDefenseResults(
  fingerprint: string,
  sessionIds: string[]
): Promise<{ deletedCount: number }> {
  try {
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
      throw new Error("Invalid input: Session IDs array is required");
    }
    
    const { defenseResultCollection } = await getCollections();
    
    const response = await defenseResultCollection.deleteMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _id: { $in: sessionIds as any },
      userFingerprint: fingerprint,
    });
    
    return { deletedCount: response.deletedCount };
  } catch (error) {
    console.error("Failed to delete defense results:", error);
    throw new Error("Database error: Failed to delete results");
  }
}
