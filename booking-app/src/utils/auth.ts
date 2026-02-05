import { compare, hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text PIN.
 * @param pin The 4-6 digit PIN to hash.
 */
export async function hashPin(pin: string): Promise<string> {
    return hash(pin, SALT_ROUNDS);
}

/**
 * Verifies a PIN against a stored hash.
 * @param pin The plain text PIN provided by the user.
 * @param hash The stored hash from the database.
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
    return compare(pin, hash);
}
