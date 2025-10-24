/**
 * Encryption Manager - Secure data encryption using Web Crypto API
 * Features: AES-256-GCM encryption, PBKDF2 key derivation, Secure key storage
 */

export class EncryptionManager {
  private algorithm = 'AES-GCM';
  private keyLength = 256;
  private iterations = 100000;
  private saltLength = 16;
  private ivLength = 12;
  private tagLength = 128;
  
  private dataKey: CryptoKey | null = null;
  private keyExpiryTime: number = 0;
  private keyLifetime = 3600000; // 1 hour

  /**
   * Initialize encryption with user credentials
   */
  async initialize(password: string, email: string): Promise<void> {
    try {
      // Generate salt from email (consistent across sessions)
      const salt = await this.generateSalt(email);
      
      // Derive master key from password
      const masterKey = await this.deriveKey(password, salt);
      
      // Generate or retrieve data encryption key
      this.dataKey = await this.getOrCreateDataKey(masterKey);
      
      // Set key expiry
      this.keyExpiryTime = Date.now() + this.keyLifetime;
      
      // Schedule key rotation
      this.scheduleKeyRotation();
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Generate salt from email (deterministic)
   */
  private async generateSalt(email: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const data = encoder.encode(email + 'MediSwift2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    // Create new ArrayBuffer to ensure proper type
    const salt = new Uint8Array(new ArrayBuffer(this.saltLength));
    salt.set(hashArray.slice(0, this.saltLength));
    return salt;
  }

  /**
   * Derive key using PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer, // Explicit cast to ArrayBuffer
        iterations: this.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get or create data encryption key
   */
  private async getOrCreateDataKey(masterKey: CryptoKey): Promise<CryptoKey> {
    try {
      // Try to retrieve existing key from secure storage
      const storedKey = await this.retrieveStoredKey(masterKey);
      if (storedKey) {
        return storedKey;
      }
    } catch (error) {
      console.log('No existing key found, generating new one');
    }

    // Generate new data key
    const dataKey = await crypto.subtle.generateKey(
      { name: this.algorithm, length: this.keyLength },
      true,
      ['encrypt', 'decrypt']
    );

    // Store encrypted data key
    await this.storeDataKey(dataKey, masterKey);
    
    return dataKey;
  }

  /**
   * Store data key encrypted with master key
   */
  private async storeDataKey(dataKey: CryptoKey, masterKey: CryptoKey): Promise<void> {
    // Export data key
    const exportedKey = await crypto.subtle.exportKey('raw', dataKey);
    
    // Encrypt with master key
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
    const encryptedKey = await crypto.subtle.encrypt(
      { name: this.algorithm, iv, tagLength: this.tagLength },
      masterKey,
      exportedKey
    );

    // Store in session storage (memory only)
    const keyData = {
      key: this.arrayBufferToBase64(encryptedKey),
      iv: this.arrayBufferToBase64(iv.buffer),
      timestamp: Date.now()
    };

    // Use session storage for temporary storage
    sessionStorage.setItem('msc_dk', JSON.stringify(keyData));
  }

  /**
   * Retrieve stored key
   */
  private async retrieveStoredKey(masterKey: CryptoKey): Promise<CryptoKey | null> {
    const stored = sessionStorage.getItem('msc_dk');
    if (!stored) return null;

    try {
      const keyData = JSON.parse(stored);
      
      // Check if key is expired
      if (Date.now() - keyData.timestamp > this.keyLifetime) {
        sessionStorage.removeItem('msc_dk');
        return null;
      }

      // Decrypt data key
      const encryptedKey = this.base64ToArrayBuffer(keyData.key);
      const iv = new Uint8Array(this.base64ToArrayBuffer(keyData.iv));
      
      const decryptedKey = await crypto.subtle.decrypt(
        { name: this.algorithm, iv, tagLength: this.tagLength },
        masterKey,
        encryptedKey
      );

      // Import key
      return crypto.subtle.importKey(
        'raw',
        decryptedKey,
        { name: this.algorithm, length: this.keyLength },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to retrieve stored key:', error);
      return null;
    }
  }

  /**
   * Encrypt data
   */
  async encrypt<T>(data: T): Promise<string> {
    if (!this.dataKey || Date.now() > this.keyExpiryTime) {
      throw new Error('Encryption key not available or expired');
    }

    try {
      // Convert data to string
      const dataStr = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataStr);

      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

      // Encrypt
      const encryptedData = await crypto.subtle.encrypt(
        { name: this.algorithm, iv, tagLength: this.tagLength },
        this.dataKey,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Return base64 encoded
      return this.arrayBufferToBase64(combined.buffer);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   */
  async decrypt<T>(encryptedData: string): Promise<T> {
    if (!this.dataKey || Date.now() > this.keyExpiryTime) {
      throw new Error('Decryption key not available or expired');
    }

    try {
      // Decode from base64
      const combined = this.base64ToArrayBuffer(encryptedData);
      const combinedArray = new Uint8Array(combined);

      // Extract IV and encrypted data
      const iv = combinedArray.slice(0, this.ivLength);
      const encrypted = combinedArray.slice(this.ivLength);

      // Decrypt
      const decryptedData = await crypto.subtle.decrypt(
        { name: this.algorithm, iv, tagLength: this.tagLength },
        this.dataKey,
        encrypted
      );

      // Convert to string and parse
      const decoder = new TextDecoder();
      const dataStr = decoder.decode(decryptedData);
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt sensitive fields only
   */
  async encryptFields<T extends Record<string, any>>(
    data: T,
    fields: string[]
  ): Promise<T> {
    const encrypted = { ...data } as any;

    for (const field of fields) {
      if (field in encrypted && encrypted[field] !== null) {
        encrypted[field] = await this.encrypt(encrypted[field]);
      }
    }

    return encrypted as T;
  }

  /**
   * Decrypt sensitive fields only
   */
  async decryptFields<T extends Record<string, any>>(
    data: T,
    fields: string[]
  ): Promise<T> {
    const decrypted = { ...data } as any;

    for (const field of fields) {
      if (field in decrypted && decrypted[field] !== null) {
        try {
          decrypted[field] = await this.decrypt(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          // Keep original value if decryption fails
        }
      }
    }

    return decrypted as T;
  }

  /**
   * Schedule key rotation
   */
  private scheduleKeyRotation(): void {
    const timeUntilExpiry = this.keyExpiryTime - Date.now();
    
    setTimeout(() => {
      console.log('Encryption key expired, rotation required');
      this.dataKey = null;
      this.keyExpiryTime = 0;
    }, timeUntilExpiry);
  }

  /**
   * Clear encryption keys
   */
  clearKeys(): void {
    this.dataKey = null;
    this.keyExpiryTime = 0;
    sessionStorage.removeItem('msc_dk');
  }

  /**
   * Check if encryption is ready
   */
  isReady(): boolean {
    return this.dataKey !== null && Date.now() < this.keyExpiryTime;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate hash for data integrity
   */
  async generateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Verify data integrity
   */
  async verifyIntegrity(data: string, hash: string): Promise<boolean> {
    const computedHash = await this.generateHash(data);
    return computedHash === hash;
  }
}

// Export singleton instance
export const encryptionManager = new EncryptionManager();
export default encryptionManager;
