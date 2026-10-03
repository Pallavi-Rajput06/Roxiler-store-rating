import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Key } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Manage Stores', path: '/admin/stores', icon: Store },
    { label: 'Change Password', path: '/change-password', icon: Key }
  ];

  return (
    <aside style={{
      width: '250px',
      background: 'rgba(15, 23, 42, 0.6)',
      borderRight: '1px solid var(--color-border)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div style={{ padding: '0 0.75rem 0.75rem 0.75rem', color: 'var(--color-text-dim)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Admin Navigation
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              color: isActive ? '#ffffff' : 'var(--color-text-muted)',
              background: isActive ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
            })}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};

export default Sidebar;
