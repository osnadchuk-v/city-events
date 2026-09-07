import { PropsWithChildren } from 'react';

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <div style={{ width: '100%'}}>
      {children}
    </div>
  );
};

export default DashboardLayout;