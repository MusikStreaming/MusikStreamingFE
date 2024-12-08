export default function AccountSettingsPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Display Name</label>
                        <input type="text" className="w-full p-2 border rounded" aria-label="Display Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" className="w-full p-2 border rounded" aria-label="Email" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Profile Picture</label>
                        <div className="border-2 border-dashed rounded p-4 text-center">
                            <p>Drag and drop an image here, or click to select</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Security</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <input type="password" className="w-full p-2 border rounded" aria-label="Current Password" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input type="password" className="w-full p-2 border rounded" aria-label="New Password" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input type="password" className="w-full p-2 border rounded" aria-label="Confirm New Password" />
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Preferences</h2>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="emailNotifications" className="mr-2" aria-label="Receive email notifications" />
                        <label htmlFor="emailNotifications">Receive email notifications</label>
                    </div>
                </div>
            </section>

            <div className="flex justify-end space-x-4">
                <button className="px-4 py-2 border rounded" aria-label="Cancel">Cancel</button>
                <button className="px-4 py-2 bg-primary text-white rounded" aria-label="Save Changes" >Save Changes</button>
            </div>
        </div>
    );
}