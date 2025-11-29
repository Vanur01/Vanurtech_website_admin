import { Suspense } from 'react';
import SignUp from './signup';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUp />
    </Suspense>
  );
}
