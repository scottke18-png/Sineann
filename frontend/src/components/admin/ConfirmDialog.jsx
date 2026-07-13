import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function ConfirmDialog({ open, onOpenChange, title = "Are you sure?", description = "", confirmLabel = "Delete", onConfirm, testId = "confirm" }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#141414] border-white/10 text-[#F5F5F0] rounded-none" data-testid={`${testId}-dialog`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-xl font-light">{title}</AlertDialogTitle>
          {description && <AlertDialogDescription className="text-secondary text-sm">{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-white/20 text-[#A8A39D] hover:bg-white/5 hover:text-[#F5F5F0] rounded-none" data-testid={`${testId}-cancel`}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-wine hover:bg-wine-hover text-[#F5F5F0] rounded-none" data-testid={`${testId}-confirm`}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
