import React, { createContext, useContext, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

const SidebarContext = createContext({
  expanded: false,
  setExpanded: () => {},
  mobileExpanded: false,
  setMobileExpanded: () => {},
});

export const useSidebar = () => {
  return useContext(SidebarContext);
};

export const SidebarProvider = ({ children }) => {
  const [expanded, setExpanded] = useState(true);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const isMobile = useIsMobile();

  return (
    <SidebarContext.Provider
      value={{
        expanded: isMobile ? mobileExpanded : expanded,
        setExpanded,
        mobileExpanded,
        setMobileExpanded,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// Exported as named export for TS/routes compatibility
export const Sidebar = ({ className, children, ...props }) => {
  const { expanded, isMobile, mobileExpanded } = useSidebar();
  
  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileExpanded && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200" />
      )}
      
      <aside
        id="main-sidebar"
        className={cn(
          "group relative flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground",
          "transition-all duration-300 ease-in-out",
          expanded ? "w-64" : "w-20",
          isMobile && "fixed inset-y-0 left-0 z-50",
          isMobile && !mobileExpanded && "translate-x-[-100%]",
          "[&_.sidebar-expanded-only]:transition-opacity [&_.sidebar-expanded-only]:duration-200",
          expanded ? "[&_.sidebar-expanded-only]:opacity-100" : "[&_.sidebar-expanded-only]:opacity-0 [&_.sidebar-expanded-only]:invisible",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </>
  );
};

export const SidebarHeader = ({ className, children, ...props }) => {
  const { expanded } = useSidebar();
  
  return (
    <div
      className={cn(
        "flex h-14 items-center border-b px-4 justify-between gap-2",
        "relative",
        className
      )}
      {...props}
    >
      {/* Logo or left content goes here */}
      <div className="flex items-center gap-2 h-full">
        {children}
      </div>
      {/* Collapse button on the right, vertically centered */}
      <div className="flex items-center h-full">
        <SidebarTrigger />
      </div>
    </div>
  );
};

export const SidebarContent = ({ className, ...props }) => {
  return (
    <div className={cn("flex-1 overflow-y-auto py-2", className)} {...props} />
  );
};

export const SidebarFooter = ({ className, ...props }) => {
  return (
    <div className={cn("border-t px-3 py-2", className)} {...props} />
  );
};

export const SidebarGroup = ({ className, ...props }) => {
  return <div className={cn("space-y-2 px-2", className)} {...props} />;
};

export const SidebarGroupLabel = ({ className, ...props }) => {
  const { expanded } = useSidebar();
  
  return expanded ? (
    <div
      className={cn(
        "px-2 py-1 text-xs font-semibold text-sidebar-foreground/80",
        className
      )}
      {...props}
    />
  ) : null;
};

export const SidebarGroupContent = ({ className, ...props }) => {
  return <div className={cn("space-y-1", className)} {...props} />;
};

export const SidebarMenu = ({ className, ...props }) => {
  return <div className={cn("space-y-1", className)} {...props} />;
};

export const SidebarMenuItem = ({ className, ...props }) => {
  return <div className={cn("", className)} {...props} />;
};

export const SidebarMenuButton = React.forwardRef(
  ({ className, asChild = false, isActive = false, children, ...props }, ref) => {
    const { expanded } = useSidebar();
    const Comp = asChild ? React.Fragment : "button";
    const childProps = asChild ? { children } : {};

    return (
      <Comp ref={ref} {...props}>
        <div
          className={cn(
            "group flex cursor-pointer items-center rounded-md px-2 py-2",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
            !expanded && "justify-center mx-auto w-full",
            className
          )}
          {...childProps}
        >
          {React.Children.map(children, (child, index) => {
            if (index === 0) {
              // This is the icon
              return React.cloneElement(child, {
                className: cn("h-5 w-5", expanded && "mr-2"),
              });
            }
            // This is the text
            return expanded ? child : null;
          })}
        </div>
      </Comp>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarTrigger = ({ className, ...props }) => {
  const { expanded, setExpanded, isMobile, mobileExpanded, setMobileExpanded } = useSidebar();
  
  const handleClick = () => {
    if (isMobile) {
      setMobileExpanded(!mobileExpanded);
    } else {
      setExpanded(!expanded);
    }
  };
  
  return (
    <button
      className={cn(
        "flex items-center justify-center h-8 w-8 rounded-full bg-card border border-border shadow hover:bg-primary/10 hover:text-primary text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 z-10",
        className
      )}
      onClick={handleClick}
      title={expanded ? "Collapse sidebar" : "Expand sidebar"}
      {...props}
    >
      <ChevronLeft className={cn("h-5 w-5 transition-transform duration-200", expanded ? "rotate-0" : "rotate-180")}/>
    </button>
  );
};
