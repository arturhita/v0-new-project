'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { sendNewsletter } from '@/lib/actions/messaging.actions';
import { useRef, useState } from 'react';

interface SendNewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendNewsletterModal({
  isOpen,
  onClose,
}: SendNewsletterModalProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await sendNewsletter(formData);

    if (result.error) {
      toast({
        title: 'Errore',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Successo',
        description: result.success,
      });
      formRef.current?.reset();
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Invia Newsletter</DialogTitle>
          <DialogDescription>
            Crea e invia una newsletter a tutti gli iscritti.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Oggetto</Label>
            <Input id="subject" name="subject" required />
          </div>
          <div>
            <Label htmlFor="content">Contenuto</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={10}
              placeholder="Scrivi qui il contenuto della tua newsletter. Puoi usare Markdown."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Invio in corso...' : 'Invia Newsletter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
