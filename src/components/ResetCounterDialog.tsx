import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSalawatCount } from "@/lib/storage";
import type { ReactNode } from "react";

/** Confirmation guard so the counter can never be wiped by a stray tap. */
export function ResetCounterDialog({ children }: { children: ReactNode }) {
  const { reset } = useSalawatCount();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تصفير العداد؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيُحذف مجموع الصلوات المُحفوظ على جهازك، ولا يمكن التراجع عن ذلك.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={reset}
          >
            تصفير
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
