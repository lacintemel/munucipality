import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useServiceRequest } from '../contexts/ServiceRequestContext';
import { useAuth } from '../contexts/AuthContext';
import { ServiceRequest } from '../types';

const statusColors = {
  pending: 'warning',
  'in-progress': 'info',
  resolved: 'success',
  rejected: 'error'
} as const;

const statusIcons = {
  pending: <PendingIcon />,
  'in-progress': <AssignmentIcon />,
  resolved: <CheckCircleIcon />,
  rejected: <ErrorIcon />
} as const;

const ServiceRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRequest, loading, error, getRequest, addComment } = useServiceRequest();
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) {
      getRequest(id);
    }
  }, [id, getRequest]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && comment.trim()) {
      await addComment(id, comment.trim());
      setComment('');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!currentRequest) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Request not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Service Request Details
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {currentRequest.title}
          </Typography>
          <Chip
            icon={statusIcons[currentRequest.status]}
            label={currentRequest.status.replace('-', ' ')}
            color={statusColors[currentRequest.status]}
          />
        </Box>

        <Typography color="text.secondary" paragraph>
          {currentRequest.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip label={`Category: ${currentRequest.category}`} />
          <Chip label={`Priority: ${currentRequest.priority}`} />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Location: {`${currentRequest.location.address.street}, ${currentRequest.location.address.city}, ${currentRequest.location.address.state} ${currentRequest.location.address.zipCode}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created: {new Date(currentRequest.createdAt).toLocaleString()}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <List>
          {currentRequest.comments.map((comment, index) => {
            console.log('Comment user data:', comment.user);
            return (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    {comment.user?.name?.[0] || 'C'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${comment.user?.name || 'Citizen'} ${comment.user?.role === 'admin' ? '(Admin)' : ''}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {comment.text}
                      </Typography>
                      <br />
                      {new Date(comment.createdAt).toLocaleString()}
                    </>
                  }
                />
              </ListItem>
              {index < currentRequest.comments.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          )})}
        </List>

        <Box component="form" onSubmit={handleAddComment} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!comment.trim()}
          >
            Add Comment
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ServiceRequestDetails; 