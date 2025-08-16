const { Webhook } = require('svix');
const User = require('../models/user.model');

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

const handleClerkWebhook = async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);
    const headers = req.headers;

    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    let evt;

    try {
      evt = wh.verify(payload, headers);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { type, data } = evt;

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const handleUserCreated = async (userData) => {
  try {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = userData;
    
    const primaryEmail = email_addresses.find(email => email.id === userData.primary_email_address_id);
    
    // Extract role from metadata or default to 'student'
    const role = public_metadata?.role || 'student';
    
    const newUser = new User({
      clerkId: id,
      name: `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User',
      email: primaryEmail?.email_address || '',
      profilePicture: image_url || '',
      role: role,
      // Set default values for required fields
      batch: public_metadata?.batch || 'Unknown',
      branch: public_metadata?.branch || 'Unknown',
      graduationYear: public_metadata?.graduationYear || new Date().getFullYear(),
      department: public_metadata?.department || 'Unknown',
      isVerified: role === 'admin' // Auto-verify admins
    });

    await newUser.save();
    console.log(`User created in MongoDB: ${newUser.email}`);
  } catch (error) {
    console.error('Error creating user in MongoDB:', error);
  }
};

const handleUserUpdated = async (userData) => {
  try {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = userData;
    
    const primaryEmail = email_addresses.find(email => email.id === userData.primary_email_address_id);
    
    const updateData = {
      name: `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User',
      email: primaryEmail?.email_address || '',
      profilePicture: image_url || '',
      lastLogin: new Date()
    };

    // Update metadata fields if provided
    if (public_metadata?.role) updateData.role = public_metadata.role;
    if (public_metadata?.batch) updateData.batch = public_metadata.batch;
    if (public_metadata?.branch) updateData.branch = public_metadata.branch;
    if (public_metadata?.graduationYear) updateData.graduationYear = public_metadata.graduationYear;
    if (public_metadata?.department) updateData.department = public_metadata.department;

    await User.findOneAndUpdate(
      { clerkId: id },
      updateData,
      { new: true }
    );
    
    console.log(`User updated in MongoDB: ${updateData.email}`);
  } catch (error) {
    console.error('Error updating user in MongoDB:', error);
  }
};

const handleUserDeleted = async (userData) => {
  try {
    const { id } = userData;
    
    await User.findOneAndDelete({ clerkId: id });
    console.log(`User deleted from MongoDB: ${id}`);
  } catch (error) {
    console.error('Error deleting user from MongoDB:', error);
  }
};

module.exports = {
  handleClerkWebhook
};