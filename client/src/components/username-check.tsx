import { useEffect, useState } from 'react';
import { useUsername } from '@/providers/username-provider';
import { UsernameModal } from './username-modal';

export function UsernameCheck() {
  const { username } = useUsername();
  const [showModal, setShowModal] = useState(false);

  // Check for username on component mount and when username changes
  useEffect(() => {
    if (!username) {
      setShowModal(true);
    } else {
      // Close the modal when username is set
      setShowModal(false);
    }
  }, [username]);

  return (
    <UsernameModal
      isOpen={showModal}
      onClose={() => {
        // Only allow closing if username is set
        if (username) {
          setShowModal(false);
        }
      }}
    />
  );
}