import { createClient } from "@/lib/supabase/server";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { ProfileForm } from "./profile-form";
import { DeleteAccountSection } from "@/components/delete-account-section";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userMetadata = user?.user_metadata || {};
    const email = user?.email || "";
    const fullName = userMetadata.full_name || "";
    const createdAt = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "";

    // Dynamic account status based on email verification
    const accountStatus = user?.email_confirmed_at ? "Active" : "Pending Verification";
    const statusColor = user?.email_confirmed_at ? "text-green-600" : "text-yellow-600";

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-ace-blue tracking-tight">
                        Profile
                    </h1>
                </div>
                <p className="text-ace-blue/60 mt-2 text-lg">
                    Manage your personal information.
                </p>
            </header>

            {/* Profile Info Card */}
            <div className="bg-white rounded-3xl border border-ace-blue/10 shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-ace-blue/10 bg-gradient-to-r from-ace-blue/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-ace-blue to-ace-light flex items-center justify-center text-white text-2xl font-bold">
                            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                            <h2 className="font-serif text-2xl text-ace-blue">
                                {fullName || "Student"}
                            </h2>
                            <p className="text-ace-blue/60 text-sm">{email}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-ace-blue/70">
                        <Mail className="h-5 w-5 text-ace-blue/40" />
                        <div>
                            <p className="text-xs text-ace-blue/50 uppercase tracking-wide">Email</p>
                            <p className="font-medium">{email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-ace-blue/70">
                        <Calendar className="h-5 w-5 text-ace-blue/40" />
                        <div>
                            <p className="text-xs text-ace-blue/50 uppercase tracking-wide">Member Since</p>
                            <p className="font-medium">{createdAt}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-ace-blue/70">
                        <Shield className="h-5 w-5 text-ace-blue/40" />
                        <div>
                            <p className="text-xs text-ace-blue/50 uppercase tracking-wide">Account Status</p>
                            <p className={`font-medium ${statusColor}`}>{accountStatus}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <ProfileForm currentName={fullName} />

            {/* Danger Zone - Delete Account */}
            <div className="mt-8">
                <DeleteAccountSection />
            </div>
        </div>
    );
}

