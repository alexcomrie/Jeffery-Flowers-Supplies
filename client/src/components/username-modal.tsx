import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUsername } from '../providers/username-provider';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsernameModal({ isOpen, onClose }: UsernameModalProps) {
  const { setUsername, isUsernameSet } = useUsername();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset input value when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!inputValue.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    if (inputValue.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (inputValue.trim().length > 30) {
      setError('Username must be less than 30 characters');
      return;
    }
    
    // Set username and close modal
    setUsername(inputValue.trim());
    setInputValue('');
    setError(null);
    
    // Only close if username is set successfully
    if (isUsernameSet) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow closing if username is set
        if (!open && isUsernameSet) {
          onClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-md"
        // Prevent closing by clicking outside or pressing escape when no username is set
        onPointerDownOutside={(e) => !isUsernameSet && e.preventDefault()}
        onEscapeKeyDown={(e) => !isUsernameSet && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Set Your Username</DialogTitle>
          {!isUsernameSet && (
            <p className="text-sm text-amber-500 mt-2">
              You must set a username to continue using the app
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="username"
              placeholder="Enter your username"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(null);
              }}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-sm text-muted-foreground">
              Your username will be displayed with your reviews and votes.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="submit">Save Username</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}