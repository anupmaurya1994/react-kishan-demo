import { useState, useEffect } from "react";
import AppHeader from "../pages/AppHeader";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "../hooks/use-toast";

export default function Setting() {
    const [activeTab, setActiveTab] = useState("personal");
    const [isLoading, setIsLoading] = useState(false);

    // Profile state
    const [profileFields, setProfileFields] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const [profileErrors, setProfileErrors] = useState({
        firstName: "",
        lastName: "",
    });

    // Password state
    const [passwordFields, setPasswordFields] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                console.log("Loaded user data for settings:", user);

                // Try to get separate fields or split from combined 'name'
                const firstName = user.firstName || (user.name ? user.name.split(" ")[0] : "");
                const lastName = user.lastName || (user.name ? user.name.split(" ").slice(1).join(" ") : "");

                setProfileFields({
                    firstName: firstName,
                    lastName: lastName,
                    email: user.email || "",
                });
            } catch (err) {
                console.error("Error parsing user data from localStorage", err);
            }
        }
    }, []);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileFields.firstName.trim() || !profileFields.lastName.trim()) {
            setProfileErrors({
                firstName: !profileFields.firstName.trim() ? "First name is required" : "",
                lastName: !profileFields.lastName.trim() ? "Last name is required" : "",
            });
            return;
        }

        setIsLoading(true);
        console.log("Updating profile info...");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://192.168.1.13:5000/api/auth/edit-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({
                    firstName: profileFields.firstName,
                    lastName: profileFields.lastName,
                    // Note: backend controller snippet didn't show email update, 
                    // but we include it if supported
                    email: profileFields.email
                }),
            });

            const data = await response.json();
            console.log("Profile update response:", data);

            if (!response.ok) {
                throw new Error(data.message || "Profile update failed");
            }

            // Sync with local storage
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const updatedUser = {
                ...storedUser,
                name: `${data.firstName || profileFields.firstName} ${data.lastName || profileFields.lastName}`,
                firstName: data.firstName || profileFields.firstName,
                lastName: data.lastName || profileFields.lastName,
                email: data.email || profileFields.email
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast({
                title: "Profile updated successfully 🎉",
                description: "Your changes have been saved."
            });
        } catch (err: any) {
            console.error("Profile update error:", err);
            toast({
                title: "Error updating profile",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const validatePasswordForm = () => {
        let errors = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };
        let isValid = true;

        if (!passwordFields.currentPassword.trim()) {
            errors.currentPassword = "Current password is required";
            isValid = false;
        }

        if (!passwordFields.newPassword.trim()) {
            errors.newPassword = "New password is required";
            isValid = false;
        } else if (passwordFields.newPassword.length < 6) {
            errors.newPassword = "Password must be at least 6 characters";
            isValid = false;
        }

        if (!passwordFields.confirmPassword.trim()) {
            errors.confirmPassword = "Please confirm your password";
            isValid = false;
        } else if (passwordFields.newPassword !== passwordFields.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        setPasswordErrors(errors);
        return isValid;
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        setIsLoading(true);
        console.log("Attempting password update...");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://192.168.1.13:5000/api/auth/edit-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({
                    currentPassword: passwordFields.currentPassword,
                    newPassword: passwordFields.newPassword,
                    confirmPassword: passwordFields.confirmPassword,
                }),
            });

            const data = await response.json();
            console.log("Password update response:", data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to update password");
            }

            toast({
                title: "Password updated successfully 🔐",
                description: "Your security settings are updated."
            });

            // Clear fields on success
            setPasswordFields({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err: any) {
            console.error("Password update error:", err);
            toast({
                title: "Error updating password",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AppHeader />

            <div className="min-h-screen bg-gray-100 py-16">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">

                        {/* Header */}
                        <div className="px-8 pt-8 pb-6">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Account Settings
                            </h1>
                        </div>

                        {/* Tabs */}
                        <div className="px-8">
                            <div className="flex gap-3 bg-gray-100 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => setActiveTab("personal")}
                                    className={`px-5 py-2 text-sm font-medium rounded-md transition ${activeTab === "personal"
                                        ? "bg-white shadow text-gray-900"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    Personal Information
                                </button>

                                <button
                                    onClick={() => setActiveTab("password")}
                                    className={`px-5 py-2 text-sm font-medium rounded-md transition ${activeTab === "password"
                                        ? "bg-white shadow text-gray-900"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-10">

                            {/* PERSONAL TAB */}
                            {activeTab === "personal" && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileFields.firstName}
                                                onChange={(e) => setProfileFields({ ...profileFields, firstName: e.target.value })}
                                                placeholder="John"
                                                className={`w-full px-4 py-2.5 rounded-lg border ${profileErrors.firstName ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition`}
                                            />
                                            {profileErrors.firstName && <p className="text-xs text-red-500 mt-1">{profileErrors.firstName}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileFields.lastName}
                                                onChange={(e) => setProfileFields({ ...profileFields, lastName: e.target.value })}
                                                placeholder="Doe"
                                                className={`w-full px-4 py-2.5 rounded-lg border ${profileErrors.lastName ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition`}
                                            />
                                            {profileErrors.lastName && <p className="text-xs text-red-500 mt-1">{profileErrors.lastName}</p>}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={profileFields.email}
                                                onChange={(e) => setProfileFields({ ...profileFields, email: e.target.value })}
                                                placeholder="john@example.com"
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2"
                                        >
                                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* PASSWORD TAB */}
                            {activeTab === "password" && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">

                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">
                                            Current Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                type={showPassword.current ? "text" : "password"}
                                                placeholder="Enter current password"
                                                value={passwordFields.currentPassword}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })}
                                                className={`w-full px-4 py-2.5 pr-12 rounded-lg border ${passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"} bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword.current ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                        {passwordErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>}
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">
                                            New Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                type={showPassword.new ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={passwordFields.newPassword}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                                                className={`w-full px-4 py-2.5 pr-12 rounded-lg border ${passwordErrors.newPassword ? "border-red-500" : "border-gray-300"} bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword.new ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                        {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">
                                            Confirm Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                type={showPassword.confirm ? "text" : "password"}
                                                placeholder="Confirm new password"
                                                value={passwordFields.confirmPassword}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
                                                className={`w-full px-4 py-2.5 pr-12 rounded-lg border ${passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"} bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                        {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>}
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2"
                                        >
                                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                                            {isLoading ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>

                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
