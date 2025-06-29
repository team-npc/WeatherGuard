import express, { Request, Response } from 'express';
import { ContactModel } from '../../src/lib/models/contact';
import { ApiResponse, Contact } from '../../src/types';

const router = express.Router();

// Get all contacts for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const contacts = await ContactModel.findByUserId(userId);
    res.json({
      success: true,
      data: contacts
    } as ApiResponse<Contact[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contacts'
    } as ApiResponse<never>);
  }
});

// Get emergency contacts for a user
router.get('/user/:userId/emergency', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const contacts = await ContactModel.findEmergencyContacts(userId);
    res.json({
      success: true,
      data: contacts
    } as ApiResponse<Contact[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch emergency contacts'
    } as ApiResponse<never>);
  }
});

// Get location sharing contacts for a user
router.get('/user/:userId/location-sharing', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const contacts = await ContactModel.findLocationSharingContacts(userId);
    res.json({
      success: true,
      data: contacts
    } as ApiResponse<Contact[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch location sharing contacts'
    } as ApiResponse<never>);
  }
});

// Create new contact
router.post('/', async (req, res) => {
  try {
    const { user_id, name, email, phone, relationship, is_emergency_contact, can_see_location } = req.body;

    if (!user_id || !name || !relationship) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, name, relationship'
      } as ApiResponse<never>);
    }

    const contactData = {
      user_id,
      name,
      email: email || undefined,
      phone: phone || undefined,
      relationship,
      is_emergency_contact: is_emergency_contact || false,
      can_see_location: can_see_location || false
    };

    const contact = await ContactModel.create(contactData);
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact created successfully'
    } as ApiResponse<Contact>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create contact'
    } as ApiResponse<never>);
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID'
      } as ApiResponse<never>);
    }

    const updates = req.body;
    const contact = await ContactModel.update(id, updates);
    
    res.json({
      success: true,
      data: contact,
      message: 'Contact updated successfully'
    } as ApiResponse<Contact>);
  } catch (error) {
    if (error instanceof Error && error.message === 'Contact not found') {
      res.status(404).json({
        success: false,
        error: 'Contact not found'
      } as ApiResponse<never>);
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update contact'
      } as ApiResponse<never>);
    }
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID'
      } as ApiResponse<never>);
    }

    await ContactModel.delete(id);
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    } as ApiResponse<never>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete contact'
    } as ApiResponse<never>);
  }
});

// Search contacts for a user
router.get('/user/:userId/search/:query', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const query = req.params.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      } as ApiResponse<never>);
    }

    const contacts = await ContactModel.searchContacts(userId, query);
    res.json({
      success: true,
      data: contacts
    } as ApiResponse<Contact[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search contacts'
    } as ApiResponse<never>);
  }
});

// Link contact to a user account
router.post('/:id/link', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { contact_user_id } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID'
      } as ApiResponse<never>);
    }

    if (!contact_user_id) {
      return res.status(400).json({
        success: false,
        error: 'contact_user_id is required'
      } as ApiResponse<never>);
    }

    const contact = await ContactModel.linkToUser(id, contact_user_id);
    res.json({
      success: true,
      data: contact,
      message: 'Contact linked to user account successfully'
    } as ApiResponse<Contact>);
  } catch (error) {
    if (error instanceof Error && error.message === 'Contact not found') {
      res.status(404).json({
        success: false,
        error: 'Contact not found'
      } as ApiResponse<never>);
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to link contact'
      } as ApiResponse<never>);
    }
  }
});

// Unlink contact from user account
router.post('/:id/unlink', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID'
      } as ApiResponse<never>);
    }

    const contact = await ContactModel.unlinkFromUser(id);
    res.json({
      success: true,
      data: contact,
      message: 'Contact unlinked from user account successfully'
    } as ApiResponse<Contact>);
  } catch (error) {
    if (error instanceof Error && error.message === 'Contact not found') {
      res.status(404).json({
        success: false,
        error: 'Contact not found'
      } as ApiResponse<never>);
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unlink contact'
      } as ApiResponse<never>);
    }
  }
});

// Check if two users are mutual contacts
router.get('/mutual/:userId1/:userId2', async (req, res) => {
  try {
    const userId1 = parseInt(req.params.userId1);
    const userId2 = parseInt(req.params.userId2);
    
    if (isNaN(userId1) || isNaN(userId2)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user IDs'
      } as ApiResponse<never>);
    }

    const areMutual = await ContactModel.findMutualContacts(userId1, userId2);
    res.json({
      success: true,
      data: { are_mutual: areMutual }
    } as ApiResponse<{ are_mutual: boolean }>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check mutual contacts'
    } as ApiResponse<never>);
  }
});

// Get contacts who can see a user's location
router.get('/user/:userId/viewers', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const contacts = await ContactModel.findContactsWhoCanSeeUser(userId);
    res.json({
      success: true,
      data: contacts
    } as ApiResponse<Contact[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch location viewers'
    } as ApiResponse<never>);
  }
});

export default router;
