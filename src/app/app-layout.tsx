import React, { useContext } from "react";
import { Nav, NavItem, NavList, Page, PageHeader, PageHeaderTools, PageSidebar } from "@patternfly/react-core";
import { KeycloakContext } from "@app/auth/keycloak/KeycloakContext";
import { RegistryMtConfigType, useRegistryMtContext } from "@app/contexts/config";

export type AppLayoutProps = {
    children?: React.ReactNode;
};

export const AppLayout: React.FunctionComponent<AppLayoutProps> = ({ children }) => {
    const keycloakContext = useContext(KeycloakContext);
    const config: RegistryMtConfigType | undefined = useRegistryMtContext();

    // Force the user to login if auth is enabled.
    if (config?.auth.enabled) {
        if (!keycloakContext.keycloak) {
            return (<div>403 Unauthorized</div>);
        }
        if (!keycloakContext.keycloak.authenticated) {
            keycloakContext.keycloak?.login();
            return <></>;
        }
    }

    const logoProps = {
        href: "/"
    };

    const logout = (): void => {
        keycloakContext.keycloak?.logout({redirectUri: window.location.href});
    };

    const logo: React.ReactNode = (
        <div className="app-logo">
            <img className="pf-c-brand logo-make" src="/images/logo.png" alt="apicurio-logo" />
            <span className="logo-model">Applications</span>
        </div>
    );

    const headerActions: React.ReactNode = (
        <PageHeaderTools style={{float: "right"}}>
            <a onClick={logout}>Logout</a>
        </PageHeaderTools>
    );

    const header = (
        <PageHeader
            logo={logo}
            logoProps={logoProps}
            headerTools={headerActions}
            showNavToggle={false}
        />
    );

    const rightNav: React.ReactNode = (
        <Nav>
            <NavList>
                <NavItem to={config?.apps?.designer} itemId="api-designer" isActive={false}>
                    API Designer
                </NavItem>
                <NavItem preventDefault to="#registry" itemId="registry" isActive={true}>
                    Registry
                </NavItem>
            </NavList>
        </Nav>
    );
    const sidebar: React.ReactNode | undefined = config?.apps?.showNav ? <PageSidebar nav={rightNav} isNavOpen={true} /> : undefined;

    return (
        <Page header={header} sidebar={sidebar}>
            {children}
        </Page>
    );
}

