import { supabase } from "@/integrations/supabase/client";

export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow using standardized redirect URL method
   * @param onboardingData - Optional onboarding data to preserve through localStorage and URL params
   */
  static async initiateGoogleAuth(onboardingData?: {
    profile?: any;
    conversation?: any;
    userName?: string;
    promptMode?: string;
  }) {
    console.log('🚀 GoogleAuthService: Starting Google OAuth with redirect URL approach');
    
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      // Store onboarding data in localStorage for retrieval after OAuth
      if (onboardingData) {
        console.log('💾 GoogleAuthService: Storing onboarding data in localStorage');
        
        // Enhanced cleanup of any existing sessions first
        await this.cleanupExistingSessions();
        
        // Generate proper UUID for the session with fallback
        let tempOnboardingId: string;
        try {
          tempOnboardingId = crypto.randomUUID();
          console.log('🔑 GoogleAuthService: Generated UUID using crypto.randomUUID():', tempOnboardingId);
        } catch (cryptoError) {
          // Fallback for older browsers
          console.warn('⚠️ GoogleAuthService: crypto.randomUUID() not available, using fallback');
          tempOnboardingId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
          console.log('🔑 GoogleAuthService: Generated fallback ID:', tempOnboardingId);
        }
        
        // Store in localStorage with temp ID for retrieval
        localStorage.setItem('temp_onboarding_id', tempOnboardingId);
        localStorage.setItem('onboarding_profile', JSON.stringify(onboardingData.profile || {}));
        localStorage.setItem('onboarding_conversation', JSON.stringify(onboardingData.conversation || {}));
        localStorage.setItem('onboarding_user_name', onboardingData.userName || '');
        localStorage.setItem('onboarding_prompt_mode', onboardingData.promptMode || 'structured');
        localStorage.setItem('onboarding_timestamp', Date.now().toString());
        
        console.log('✅ GoogleAuthService: Onboarding data stored with temp ID:', tempOnboardingId);
        
        // Also store in database for backup with proper error handling and duplicate prevention
        try {
          // First check if a record with this ID already exists
          const { data: existingRecord } = await supabase
            .from('onboarding_data')
            .select('id')
            .eq('id', tempOnboardingId)
            .single();
          
          if (existingRecord) {
            console.log('⚠️ GoogleAuthService: Record with this ID already exists, updating instead');
            await supabase
              .from('onboarding_data')
              .update({
                user_id: tempOnboardingId,
                profile_data: onboardingData.profile || {},
                conversation_data: onboardingData.conversation || {},
                prompt_mode: onboardingData.promptMode || 'structured',
                is_anonymous: true
              })
              .eq('id', tempOnboardingId);
          } else {
            await supabase
              .from('onboarding_data')
              .insert({
                id: tempOnboardingId, // Use the UUID as id
                user_id: tempOnboardingId, // Use temp ID as user_id for anonymous records
                profile_data: onboardingData.profile || {},
                conversation_data: onboardingData.conversation || {},
                prompt_mode: onboardingData.promptMode || 'structured',
                is_anonymous: true
              });
          }
          
          console.log('✅ GoogleAuthService: Backup onboarding data stored in database');
        } catch (dbError) {
          console.warn('⚠️ GoogleAuthService: Failed to store backup onboarding data:', dbError);
          // Continue with OAuth even if backup storage fails
        }
        
        // Add onboarding ID to redirect URL for retrieval
        const urlWithOnboarding = `${redirectTo}?onboarding_id=${tempOnboardingId}`;
        
        console.log('🔗 GoogleAuthService: Starting OAuth with onboarding redirect:', urlWithOnboarding);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: urlWithOnboarding
          }
        });
        
        if (error) {
          console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
          // Clean up on failure
          await this.cleanupOnboardingData(tempOnboardingId);
          throw error;
        }
        
      } else {
        console.log('🔗 GoogleAuthService: Starting OAuth without onboarding data');
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo
          }
        });
        
        if (error) {
          console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
          throw error;
        }
      }
      
      console.log('✅ GoogleAuthService: OAuth flow initiated successfully with redirect URL method');
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Enhanced cleanup of any existing onboarding sessions to prevent duplicates
   */
  static async cleanupExistingSessions() {
    try {
      console.log('🧹 GoogleAuthService: Starting enhanced cleanup of existing sessions...');
      
      // Get all existing session IDs that might need cleanup
      const existingIds = [
        localStorage.getItem('temp_onboarding_id'),
        localStorage.getItem('oauth_temp_onboarding_id'),
        sessionStorage.getItem('temp_onboarding_id')
      ].filter(Boolean);
      
      // Remove duplicates
      const uniqueIds = [...new Set(existingIds)];
      
      console.log('🔍 GoogleAuthService: Found existing session IDs to cleanup:', uniqueIds);
      
      // Clean up database records for all found IDs
      for (const id of uniqueIds) {
        if (id) {
          try {
            const { error } = await supabase
              .from('onboarding_data')
              .delete()
              .eq('id', id)
              .eq('is_anonymous', true);
            
            if (error) {
              console.warn(`⚠️ GoogleAuthService: Failed to cleanup database record for ID ${id}:`, error);
            } else {
              console.log(`✅ GoogleAuthService: Cleaned up database record for ID: ${id}`);
            }
          } catch (dbError) {
            console.warn(`⚠️ GoogleAuthService: Database cleanup error for ID ${id}:`, dbError);
          }
        }
      }
      
      // Clean up localStorage backup keys
      const backupKey = localStorage.getItem('latestBackupKey');
      if (backupKey) {
        localStorage.removeItem(backupKey);
        localStorage.removeItem('latestBackupKey');
        console.log('🧹 GoogleAuthService: Cleaned up backup key:', backupKey);
      }
      
      // Clean up any stale backup keys (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('onboardingBackup_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && data.timestamp < oneHourAgo) {
              localStorage.removeItem(key);
              console.log('🧹 GoogleAuthService: Cleaned up stale backup key:', key);
            }
          } catch (parseError) {
            // If we can't parse, it's probably corrupted, so remove it
            localStorage.removeItem(key);
            console.log('🧹 GoogleAuthService: Cleaned up corrupted backup key:', key);
          }
        }
      }
      
      console.log('✅ GoogleAuthService: Enhanced existing sessions cleanup completed');
    } catch (error) {
      console.warn('⚠️ GoogleAuthService: Error cleaning up existing sessions:', error);
    }
  }

  /**
   * Retrieve onboarding data using onboarding ID from URL or localStorage
   * @param onboardingId - Onboarding ID from URL query parameter or localStorage
   */
  static async retrieveOnboardingData(onboardingId: string) {
    try {
      console.log('🔍 GoogleAuthService: Retrieving onboarding data for ID:', onboardingId);
      
      // Try to get from localStorage first (most reliable)
      const localProfile = localStorage.getItem('onboarding_profile');
      const localConversation = localStorage.getItem('onboarding_conversation');
      const localUserName = localStorage.getItem('onboarding_user_name');
      const localPromptMode = localStorage.getItem('onboarding_prompt_mode');
      const localTempId = localStorage.getItem('temp_onboarding_id');
      
      if (localProfile && localConversation && localTempId === onboardingId) {
        console.log('✅ GoogleAuthService: Retrieved onboarding data from localStorage');
        
        return {
          id: onboardingId,
          profile: JSON.parse(localProfile),
          conversation: JSON.parse(localConversation),
          userName: localUserName || '',
          promptMode: localPromptMode || 'structured'
        };
      }
      
      // Fallback to database if localStorage is not available
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('id', onboardingId)
        .eq('is_anonymous', true)
        .single();
      
      if (error) {
        console.error('❌ GoogleAuthService: Error retrieving onboarding data:', error);
        return null;
      }
      
      if (data) {
        console.log('✅ GoogleAuthService: Successfully retrieved onboarding data from database');
        
        return {
          id: data.id,
          profile: data.profile_data,
          conversation: data.conversation_data,
          promptMode: data.prompt_mode
        };
      }
      
      console.log('⚠️ GoogleAuthService: No onboarding data found for ID');
      return null;
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in retrieveOnboardingData:', error);
      return null;
    }
  }

  /**
   * Ultra-enhanced cleanup of temporary onboarding data after successful OAuth
   * @param onboardingId - Onboarding ID identifying the record to clean up
   */
  static async cleanupOnboardingData(onboardingId: string) {
    try {
      console.log('🧹 GoogleAuthService: Starting ultra-enhanced cleanup for ID:', onboardingId);
      
      // Clean up localStorage with comprehensive removal
      const keysToRemove = [
        'temp_onboarding_id',
        'onboarding_profile',
        'onboarding_conversation',
        'onboarding_user_name',
        'onboarding_prompt_mode',
        'onboarding_timestamp',
        'latestBackupKey',
        'oauth_onboardingProfile',
        'oauth_onboardingUserName',
        'oauth_onboardingConversation',
        'oauth_onboardingPromptMode',
        'oauth_temp_onboarding_id'
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🧹 GoogleAuthService: Removed localStorage key: ${key}`);
        }
      });
      
      // Clean up backup keys that include the onboarding ID
      const backupKey = `onboardingBackup_${onboardingId}`;
      if (localStorage.getItem(backupKey)) {
        localStorage.removeItem(backupKey);
        console.log(`🧹 GoogleAuthService: Removed backup key: ${backupKey}`);
      }
      
      // Clean up sessionStorage
      const sessionKeysToRemove = [
        'onboarding_profile',
        'onboarding_user_name',
        'onboarding_conversation',
        'onboarding_prompt_mode',
        'temp_onboarding_id',
        'onboardingBackup'
      ];
      
      sessionKeysToRemove.forEach(key => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
          console.log(`🧹 GoogleAuthService: Removed sessionStorage key: ${key}`);
        }
      });
      
      // Enhanced database cleanup with duplicate removal
      console.log('🗄️ GoogleAuthService: Starting database cleanup with duplicate removal...');
      
      // First, find all duplicate records for this onboarding ID
      const { data: duplicates } = await supabase
        .from('onboarding_data')
        .select('id, created_at')
        .eq('user_id', onboardingId)
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false });
      
      if (duplicates && duplicates.length > 0) {
        console.log(`🔍 GoogleAuthService: Found ${duplicates.length} records for cleanup`);
        
        // Clean up all records with this user_id
        let cleanupAttempts = 0;
        const maxCleanupAttempts = 3;
        let cleanupSuccess = false;
        
        while (!cleanupSuccess && cleanupAttempts < maxCleanupAttempts) {
          cleanupAttempts++;
          console.log(`🔄 GoogleAuthService: Database cleanup attempt ${cleanupAttempts}/${maxCleanupAttempts}`);
          
          try {
            const { error } = await supabase
              .from('onboarding_data')
              .delete()
              .eq('user_id', onboardingId)
              .eq('is_anonymous', true);
            
            if (error) {
              console.error(`❌ GoogleAuthService: Database cleanup attempt ${cleanupAttempts} failed:`, error);
              if (cleanupAttempts < maxCleanupAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
              }
            } else {
              cleanupSuccess = true;
              console.log('✅ GoogleAuthService: Database cleanup successful - removed all duplicates');
            }
          } catch (dbError) {
            console.error(`❌ GoogleAuthService: Database cleanup attempt ${cleanupAttempts} error:`, dbError);
            if (cleanupAttempts < maxCleanupAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
          }
        }
        
        if (!cleanupSuccess) {
          console.error('❌ GoogleAuthService: All database cleanup attempts failed');
        }
      } else {
        console.log('ℹ️ GoogleAuthService: No duplicate records found for cleanup');
      }
      
      // Additional cleanup: remove any orphaned records older than 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      try {
        const { error: orphanError } = await supabase
          .from('onboarding_data')
          .delete()
          .eq('is_anonymous', true)
          .lt('created_at', twentyFourHoursAgo);
        
        if (orphanError) {
          console.warn('⚠️ GoogleAuthService: Failed to cleanup orphaned records:', orphanError);
        } else {
          console.log('✅ GoogleAuthService: Cleaned up orphaned records older than 24 hours');
        }
      } catch (orphanCleanupError) {
        console.warn('⚠️ GoogleAuthService: Error cleaning up orphaned records:', orphanCleanupError);
      }
      
      console.log('✅ GoogleAuthService: Ultra-enhanced cleanup completed for ID:', onboardingId);
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in ultra-enhanced cleanup:', error);
    }
  }

  /**
   * Get YouTube OAuth URL for connecting YouTube accounts
   */
  static getYouTubeAuthUrl(): string {
    // Use the edge function to get the YouTube auth URL
    const origin = window.location.origin;
    const redirectUri = `${origin}/youtube/callback`;
    
    // Call the edge function that generates the YouTube auth URL
    return `${origin}/api/google-auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from OAuth callback
   */
  static async exchangeCodeForToken(code: string) {
    try {
      console.log('🔄 GoogleAuthService: Exchanging code for token');
      
      const response = await fetch('/api/google-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GoogleAuthService: Token exchange failed:', errorText);
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const tokenData = await response.json();
      console.log('✅ GoogleAuthService: Token exchange successful');
      
      return tokenData;
    } catch (error) {
      console.error('❌ GoogleAuthService: Error exchanging code for token:', error);
      throw error;
    }
  }
}
