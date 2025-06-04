
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from '@/types/chat';

export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow using Supabase's built-in OAuth handling
   * @param onboardingData - Optional onboarding data to preserve through localStorage and URL params
   */
  static async initiateGoogleAuth(onboardingData?: {
    profile?: any;
    conversation?: any;
    userName?: string;
    promptMode?: string;
  }) {
    console.log('🚀 GoogleAuthService: Starting Google OAuth with enhanced conversation preservation');
    
    try {
      // Store onboarding data in localStorage for retrieval after OAuth
      if (onboardingData) {
        console.log('💾 GoogleAuthService: Storing onboarding data with enhanced conversation validation');
        
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
        
        // ENHANCED: Validate and normalize conversation data before storage
        let conversationToStore = onboardingData.conversation || {};
        
        // Ensure conversation has proper structure
        if (!conversationToStore.messages || !Array.isArray(conversationToStore.messages)) {
          conversationToStore.messages = [];
        }
        if (!conversationToStore.userAnswers || !Array.isArray(conversationToStore.userAnswers)) {
          conversationToStore.userAnswers = [];
        }
        
        console.log('📊 GoogleAuthService: Validated conversation data:', {
          messageCount: conversationToStore.messages.length,
          userAnswerCount: conversationToStore.userAnswers.length,
          hasValidStructure: !!(conversationToStore.messages && conversationToStore.userAnswers)
        });
        
        // Store in localStorage with enhanced validation and multiple key patterns
        localStorage.setItem('temp_onboarding_id', tempOnboardingId);
        localStorage.setItem('onboarding_profile', JSON.stringify(onboardingData.profile || {}));
        localStorage.setItem('onboarding_conversation', JSON.stringify(conversationToStore));
        localStorage.setItem('onboarding_user_name', onboardingData.userName || '');
        localStorage.setItem('onboarding_prompt_mode', onboardingData.promptMode || 'structured');
        localStorage.setItem('onboarding_timestamp', Date.now().toString());
        
        // Additional compatibility keys for OAuth retrieval
        localStorage.setItem('oauth_onboardingProfile', JSON.stringify(onboardingData.profile || {}));
        localStorage.setItem('oauth_onboardingConversation', JSON.stringify(conversationToStore));
        localStorage.setItem('oauth_onboardingUserName', onboardingData.userName || '');
        localStorage.setItem('oauth_onboardingPromptMode', onboardingData.promptMode || 'structured');
        localStorage.setItem('oauth_temp_onboarding_id', tempOnboardingId);
        
        console.log('✅ GoogleAuthService: Enhanced onboarding data stored with temp ID:', tempOnboardingId);
        
        // Also store in database for backup with enhanced conversation validation
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
                profile_data: onboardingData.profile || {},
                onboarding_conversation: conversationToStore,
                onboarding_mode: onboardingData.promptMode || 'structured'
              })
              .eq('id', tempOnboardingId);
          } else {
            await supabase
              .from('onboarding_data')
              .insert({
                id: tempOnboardingId,
                profile_data: onboardingData.profile || {},
                onboarding_conversation: conversationToStore,
                onboarding_mode: onboardingData.promptMode || 'structured'
              });
          }
          
          console.log('✅ GoogleAuthService: Enhanced backup onboarding data stored in database with conversation validation');
        } catch (dbError) {
          console.warn('⚠️ GoogleAuthService: Failed to store backup onboarding data:', dbError);
          // Continue with OAuth even if backup storage fails
        }
        
        // Set OAuth context for onboarding results
        localStorage.setItem('oauth_context', 'onboarding_results');
        
        console.log('🔗 GoogleAuthService: Starting OAuth with onboarding context');
        
        // Use Supabase's built-in OAuth with proper authorization code flow
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?onboarding_id=${tempOnboardingId}`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
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
        
        // Set OAuth context for standard auth
        localStorage.setItem('oauth_context', 'standard_auth');
        
        // Use Supabase's built-in OAuth with proper authorization code flow
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });
        
        if (error) {
          console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
          localStorage.removeItem('oauth_context');
          throw error;
        }
      }
      
      console.log('✅ GoogleAuthService: OAuth flow initiated successfully');
      
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
              .eq('id', id);
            
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
   * Helper function to safely parse and validate conversation data
   */
  private static parseConversationData(data: any): Conversation {
    // Simple validation without complex type operations
    if (data && typeof data === 'object' && 
        Array.isArray(data.messages) && 
        Array.isArray(data.userAnswers)) {
      return {
        messages: data.messages,
        userAnswers: data.userAnswers
      };
    }
    
    // Return default structure if invalid
    return { messages: [], userAnswers: [] };
  }

  /**
   * ENHANCED: Retrieve onboarding data with improved conversation validation
   * @param onboardingId - Onboarding ID from URL query parameter or localStorage
   */
  static async retrieveOnboardingData(onboardingId: string) {
    try {
      console.log('🔍 GoogleAuthService: Retrieving onboarding data with enhanced conversation validation for ID:', onboardingId);
      
      // Strategy 1: Try to get from localStorage first (most reliable)
      const localProfile = localStorage.getItem('onboarding_profile') || localStorage.getItem('oauth_onboardingProfile');
      const localConversation = localStorage.getItem('onboarding_conversation') || localStorage.getItem('oauth_onboardingConversation');
      const localUserName = localStorage.getItem('onboarding_user_name') || localStorage.getItem('oauth_onboardingUserName');
      const localPromptMode = localStorage.getItem('onboarding_prompt_mode') || localStorage.getItem('oauth_onboardingPromptMode');
      const localTempId = localStorage.getItem('temp_onboarding_id') || localStorage.getItem('oauth_temp_onboarding_id');
      
      if (localProfile && localConversation && localTempId === onboardingId) {
        console.log('✅ GoogleAuthService: Retrieved onboarding data from localStorage');
        
        let parsedConversation: Conversation;
        try {
          const rawConversation = JSON.parse(localConversation);
          parsedConversation = this.parseConversationData(rawConversation);
          
          console.log('📊 GoogleAuthService: Validated conversation data from localStorage:', {
            messageCount: parsedConversation.messages.length,
            userAnswerCount: parsedConversation.userAnswers.length
          });
          
        } catch (parseError) {
          console.error('❌ GoogleAuthService: Error parsing conversation from localStorage:', parseError);
          parsedConversation = { messages: [], userAnswers: [] };
        }
        
        return {
          id: onboardingId,
          profile: JSON.parse(localProfile),
          conversation: parsedConversation,
          userName: localUserName || '',
          promptMode: localPromptMode || 'structured'
        };
      }
      
      // Strategy 2: Fallback to database if localStorage is not available
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('id', onboardingId)
        .single();
      
      if (error) {
        console.error('❌ GoogleAuthService: Error retrieving onboarding data:', error);
        return null;
      }
      
      if (data) {
        console.log('✅ GoogleAuthService: Successfully retrieved onboarding data from database');
        
        // Parse and validate conversation data from database
        const conversationData = this.parseConversationData(data.onboarding_conversation);
        
        console.log('📊 GoogleAuthService: Validated conversation data from database:', {
          messageCount: conversationData.messages.length,
          userAnswerCount: conversationData.userAnswers.length
        });
        
        return {
          id: data.id,
          profile: data.profile_data,
          conversation: conversationData,
          promptMode: data.onboarding_mode
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
      
      // Enhanced localStorage cleanup with OAuth-specific keys
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
        'oauth_temp_onboarding_id',
        'oauth_context'
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
        .eq('id', onboardingId)
        .order('created_at', { ascending: false });
      
      if (duplicates && duplicates.length > 0) {
        console.log(`🔍 GoogleAuthService: Found ${duplicates.length} records for cleanup`);
        
        // Clean up all records with this ID
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
              .eq('id', onboardingId);
            
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
    // FIXED: Use the correct redirect URI that matches the YouTube callback route
    const redirectUri = `${window.location.origin}/auth/callback/youtube`;
    
    // Use the existing google-auth-url edge function with the YouTube-specific redirect URI
    return `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url?redirect_uri=${encodeURIComponent(redirectUri)}&state=youtube_auth`;
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from OAuth callback
   */
  static async exchangeCodeForToken(code: string) {
    try {
      console.log('🔄 GoogleAuthService: Exchanging code for token');
      
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: { code }
      });

      if (error) {
        console.error('❌ GoogleAuthService: Token exchange failed:', error);
        throw new Error(`Token exchange failed: ${error.message}`);
      }

      console.log('✅ GoogleAuthService: Token exchange successful');
      
      return data;
    } catch (error) {
      console.error('❌ GoogleAuthService: Error exchanging code for token:', error);
      throw error;
    }
  }
}
