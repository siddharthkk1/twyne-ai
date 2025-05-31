
import { supabase } from "@/integrations/supabase/client";

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class GoogleAuthService {
  private static readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  static getYouTubeAuthUrl(): string {
    // Always use the current origin for consistency
    const currentOrigin = window.location.origin;
    
    // Use the standard auth callback route to ensure proper session handling
    const redirectUri = `${currentOrigin}/auth/callback`;
    
    // Use the Supabase function to generate the auth URL
    const authUrlBase = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url`;
    
    console.log('GoogleAuthService: Requesting YouTube auth');
    console.log('GoogleAuthService: Current origin:', currentOrigin);
    console.log('GoogleAuthService: Redirect URI:', redirectUri);
    
    // Enhanced pre-OAuth data preservation with detailed logging
    this.preserveOnboardingDataForOAuth();
    
    return `${authUrlBase}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  
  /**
   * Enhanced data preservation before OAuth with multiple backup strategies and detailed logging
   */
  private static preserveOnboardingDataForOAuth(): void {
    try {
      console.log('🔄 GoogleAuthService: Starting enhanced data preservation...');
      console.log('🔍 GoogleAuthService: Current localStorage keys:', Object.keys(localStorage));
      console.log('🔍 GoogleAuthService: Current sessionStorage keys:', Object.keys(sessionStorage));
      
      // Get all onboarding-related data with detailed logging
      const onboardingData = {
        profile: localStorage.getItem('onboardingProfile'),
        userName: localStorage.getItem('onboardingUserName'),
        conversation: localStorage.getItem('onboardingConversation'),
        promptMode: localStorage.getItem('onboardingPromptMode')
      };
      
      console.log('📊 GoogleAuthService: Raw onboarding data found:', {
        profileLength: onboardingData.profile?.length || 0,
        userNameValue: onboardingData.userName,
        conversationLength: onboardingData.conversation?.length || 0,
        promptModeValue: onboardingData.promptMode,
        profilePreview: onboardingData.profile ? onboardingData.profile.substring(0, 100) + '...' : null,
        conversationPreview: onboardingData.conversation ? onboardingData.conversation.substring(0, 100) + '...' : null
      });
      
      if (onboardingData.profile || onboardingData.userName || onboardingData.conversation) {
        const timestamp = Date.now();
        console.log('✅ GoogleAuthService: Found onboarding data to preserve, timestamp:', timestamp);
        
        // Strategy 1: Store in sessionStorage (survives redirects but not new tabs)
        const sessionBackup = {
          ...onboardingData,
          timestamp,
          source: 'pre-oauth-backup'
        };
        sessionStorage.setItem('onboardingBackup', JSON.stringify(sessionBackup));
        console.log('💾 GoogleAuthService: Strategy 1 - Stored backup in sessionStorage, size:', JSON.stringify(sessionBackup).length);
        
        // Strategy 2: Enhanced localStorage backup with random suffix to avoid conflicts
        const backupKey = `onboardingBackup_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(backupKey, JSON.stringify(sessionBackup));
        localStorage.setItem('latestBackupKey', backupKey);
        console.log('💾 GoogleAuthService: Strategy 2 - Stored backup in localStorage with key:', backupKey);
        
        // Strategy 3: Store individual backup items with OAuth prefix
        if (onboardingData.profile) {
          localStorage.setItem('oauth_onboardingProfile', onboardingData.profile);
          sessionStorage.setItem('oauth_onboardingProfile', onboardingData.profile);
          console.log('💾 GoogleAuthService: Strategy 3a - Stored oauth_onboardingProfile');
        }
        if (onboardingData.userName) {
          localStorage.setItem('oauth_onboardingUserName', onboardingData.userName);
          sessionStorage.setItem('oauth_onboardingUserName', onboardingData.userName);
          console.log('💾 GoogleAuthService: Strategy 3b - Stored oauth_onboardingUserName:', onboardingData.userName);
        }
        if (onboardingData.conversation) {
          localStorage.setItem('oauth_onboardingConversation', onboardingData.conversation);
          sessionStorage.setItem('oauth_onboardingConversation', onboardingData.conversation);
          console.log('💾 GoogleAuthService: Strategy 3c - Stored oauth_onboardingConversation');
        }
        if (onboardingData.promptMode) {
          localStorage.setItem('oauth_onboardingPromptMode', onboardingData.promptMode);
          sessionStorage.setItem('oauth_onboardingPromptMode', onboardingData.promptMode);
          console.log('💾 GoogleAuthService: Strategy 3d - Stored oauth_onboardingPromptMode:', onboardingData.promptMode);
        }
        
        // Strategy 4: Temporary database storage for anonymous users
        this.storeDataInTempTable(sessionBackup);
        
        console.log('✅ GoogleAuthService: All backup strategies completed successfully');
        
        // Verification logging
        this.verifyDataPersistence();
        
      } else {
        console.log('⚠️ GoogleAuthService: No onboarding data found to preserve');
        console.log('🔍 GoogleAuthService: Detailed check - profile exists:', !!onboardingData.profile);
        console.log('🔍 GoogleAuthService: Detailed check - userName exists:', !!onboardingData.userName);
        console.log('🔍 GoogleAuthService: Detailed check - conversation exists:', !!onboardingData.conversation);
        console.log('🔍 GoogleAuthService: Detailed check - promptMode exists:', !!onboardingData.promptMode);
      }
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in data preservation:', error);
      console.error('❌ GoogleAuthService: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }
  
  /**
   * Verify that data was actually stored correctly
   */
  private static verifyDataPersistence(): void {
    console.log('🔍 GoogleAuthService: Starting data persistence verification...');
    
    try {
      // Check sessionStorage
      const sessionBackup = sessionStorage.getItem('onboardingBackup');
      console.log('🔍 GoogleAuthService: SessionStorage verification - backup exists:', !!sessionBackup);
      if (sessionBackup) {
        const parsed = JSON.parse(sessionBackup);
        console.log('🔍 GoogleAuthService: SessionStorage backup keys:', Object.keys(parsed));
      }
      
      // Check localStorage with latest backup key
      const latestBackupKey = localStorage.getItem('latestBackupKey');
      console.log('🔍 GoogleAuthService: Latest backup key:', latestBackupKey);
      if (latestBackupKey) {
        const backupData = localStorage.getItem(latestBackupKey);
        console.log('🔍 GoogleAuthService: Latest backup exists:', !!backupData);
      }
      
      // Check OAuth-prefixed items
      const oauthProfile = localStorage.getItem('oauth_onboardingProfile');
      const oauthUserName = localStorage.getItem('oauth_onboardingUserName');
      const oauthConversation = localStorage.getItem('oauth_onboardingConversation');
      const oauthPromptMode = localStorage.getItem('oauth_onboardingPromptMode');
      
      console.log('🔍 GoogleAuthService: OAuth-prefixed verification:', {
        profile: !!oauthProfile,
        userName: !!oauthUserName && oauthUserName,
        conversation: !!oauthConversation,
        promptMode: !!oauthPromptMode && oauthPromptMode
      });
      
      console.log('✅ GoogleAuthService: Data persistence verification completed');
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in data persistence verification:', error);
    }
  }
  
  /**
   * Store data temporarily in database for recovery
   */
  private static async storeDataInTempTable(data: any): Promise<void> {
    try {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🗄️ GoogleAuthService: Attempting to store data in temp database with ID:', tempId);
      
      const insertData = {
        user_id: tempId,
        profile_data: data.profile ? JSON.parse(data.profile) : {},
        conversation_data: data.conversation ? JSON.parse(data.conversation) : {},
        prompt_mode: data.promptMode || 'structured',
        is_anonymous: true
      };
      
      console.log('🗄️ GoogleAuthService: Insert data structure:', {
        user_id: insertData.user_id,
        has_profile_data: Object.keys(insertData.profile_data).length > 0,
        has_conversation_data: Object.keys(insertData.conversation_data).length > 0,
        prompt_mode: insertData.prompt_mode
      });
      
      const { error } = await supabase
        .from('onboarding_data')
        .insert(insertData);
      
      if (!error) {
        localStorage.setItem('tempOnboardingId', tempId);
        console.log('✅ GoogleAuthService: Successfully stored data in temp database table with ID:', tempId);
      } else {
        console.error('❌ GoogleAuthService: Error storing temp data:', error);
        console.error('❌ GoogleAuthService: Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }
    } catch (error) {
      console.error('❌ GoogleAuthService: Exception in storeDataInTempTable:', error);
    }
  }
  
  static async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    console.log('🔄 GoogleAuthService: Starting token exchange');
    console.log('🔍 GoogleAuthService: Code length:', code?.length || 0);
    console.log('🔍 GoogleAuthService: Code preview:', code?.substring(0, 20) + '...');
    
    const { data, error } = await supabase.functions.invoke('google-auth', {
      body: { code }
    });
    
    if (error) {
      console.error('❌ GoogleAuthService: Token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }
    
    if (!data || !data.access_token) {
      console.error('❌ GoogleAuthService: Invalid token response:', data);
      throw new Error('Invalid token response from server');
    }
    
    console.log('✅ GoogleAuthService: Token exchange successful');
    
    return data;
  }
}
