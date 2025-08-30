import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PermissionDebugger: React.FC = () => {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permission Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No user logged in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium">User Info:</h4>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> <Badge>{user.role}</Badge></p>
        </div>
        
        <div>
          <h4 className="font-medium">User Permissions Array:</h4>
          <div className="flex flex-wrap gap-1">
            {user.permissions && user.permissions.length > 0 ? (
              user.permissions.map((perm, index) => (
                <Badge key={index} variant="outline">{perm}</Badge>
              ))
            ) : (
              <span className="text-muted-foreground">No permissions array or empty</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium">Permission Checks:</h4>
          <div className="space-y-1">
            <p>manage_store: <Badge variant={hasPermission('manage_store') ? 'default' : 'destructive'}>
              {hasPermission('manage_store') ? 'ALLOWED' : 'DENIED'}
            </Badge></p>
            <p>manage_store_users: <Badge variant={hasPermission('manage_store_users') ? 'default' : 'destructive'}>
              {hasPermission('manage_store_users') ? 'ALLOWED' : 'DENIED'}
            </Badge></p>
            <p>all: <Badge variant={hasPermission('all') ? 'default' : 'destructive'}>
              {hasPermission('all') ? 'ALLOWED' : 'DENIED'}
            </Badge></p>
          </div>
        </div>

        <div>
          <h4 className="font-medium">Raw User Object:</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionDebugger;
