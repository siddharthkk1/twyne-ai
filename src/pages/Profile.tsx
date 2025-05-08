
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
        setIsEditing(false);
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get first letter of name for avatar placeholder
  const nameInitial = profile?.full_name 
    ? profile.full_name[0] 
    : profile?.username 
      ? profile.username[0] 
      : user?.email?.[0] || "?";

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      <div className="bg-background rounded-2xl p-6 shadow-sm">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <div className="h-24 w-24 rounded-full bg-secondary/50 mb-4 flex items-center justify-center text-2xl font-semibold">
                {nameInitial}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Your username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Your location (e.g., San Francisco)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">About You</Label>
                <Textarea 
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="h-24 w-24 rounded-full bg-secondary/50 mb-4 flex items-center justify-center text-2xl font-semibold">
                {nameInitial}
              </div>
              <h2 className="text-xl font-medium">{profile?.full_name || profile?.username || user?.email?.split('@')[0]}</h2>
              <p className="text-muted-foreground">{profile?.location || 'No location set'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ABOUT YOU</h3>
                <p className="mt-1">
                  {profile?.bio || 'No bio added yet'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">EMAIL</h3>
                <p className="mt-1">{user?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">USERNAME</h3>
                <p className="mt-1">{profile?.username || 'No username set'}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full rounded-full"
          onClick={() => setIsEditing(true)}
          disabled={isEditing}
        >
          Edit Profile
        </Button>
        <Button variant="outline" className="w-full rounded-full text-muted-foreground" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
