import React, { FunctionComponent, useState } from "react";
import "./registry-instances.css";
import { If, ListWithToolbar, NavLink } from "@app/components";
import { Registry, RegistryStatusValue } from "@rhoas/registry-management-sdk";
import { ResponsiveTable } from "@rhoas/app-services-ui-components";
import { AddCircleOIcon, ExclamationTriangleIcon } from "@patternfly/react-icons";
import { IAction } from "@patternfly/react-table";
import { ThProps } from "@patternfly/react-table/src/components/TableComposable/Th";
import {
    Button,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    EmptyStateVariant,
    KebabToggle,
    Spinner,
    Title,
    ToolbarGroup,
    ToolbarItem,
    Truncate
} from "@patternfly/react-core";
import { CustomActionsToggleProps } from "@patternfly/react-table/src/components/Table/ActionsColumn";
import Moment from "react-moment";
import { RegistryStatusLabel } from "@app/pages/components";


export type RegistryInstancesProps = {
    isLoadingInstances: boolean;
    instances: Registry[] | undefined;
    selectedInstance: Registry | undefined;
    onInstanceSelected: (instance: Registry | undefined) => void;
    onCreateInstanceClick: () => void;
    onDeleteInstanceClick: (instance: Registry | undefined) => void;
}


export const RegistryInstances: FunctionComponent<RegistryInstancesProps> = (
    { isLoadingInstances, instances, selectedInstance, onInstanceSelected, onCreateInstanceClick, onDeleteInstanceClick }: RegistryInstancesProps) => {

    const [sortByIndex, setSortByIndex] = useState<number>();

    const columns: any[] = [
        { index: 0, id: "name", label: "Name", width: 30, sortable: false },
        { index: 1, id: "owner", label: "Owner", width: 15, sortable: false },
        { index: 2, id: "status", label: "Status", width: 15, sortable: false },
        { index: 3, id: "created_at", label: "Created At", width: 25, sortable: false },
    ];

    const renderRegistryName = (registry: Registry) => {
        if (registry.status && registry.status === RegistryStatusValue.Ready) {
            return <div>
                <div>
                    <NavLink className="registry-title" location={`/instances/${registry.id}`}>{registry.name!}</NavLink>
                </div>
                <If condition={registry.description !== undefined && registry.description.length > 0}>
                    <Truncate className="registry-summary" content={registry.description!}></Truncate>
                </If>
            </div>
        } else {
            return <div>
                <div>{registry.name!}</div>
                <If condition={registry.description !== undefined && registry.description.length > 0}>
                    <Truncate className="registry-summary" content={registry.description!}></Truncate>
                </If>
            </div>
        }
    }

    const renderColumnData = (registry: Registry, colIndex: number): React.ReactNode => {
        // Name.
        if (colIndex === 0) {
            return renderRegistryName(registry);
        }
        // Owner.
        if (colIndex === 1) {
            return <Truncate content={registry.owner!} tooltipPosition="top" />
        }
        // Status.
        if (colIndex === 2) {
            return <RegistryStatusLabel registry={registry} />;
        }
        // Created At.
        if (colIndex === 3) {
            return <Moment date={registry.created_at} fromNow={true} />
        }
        return <span />
    };

    const renderActionsToggle = (props: CustomActionsToggleProps): React.ReactNode => {
        return <KebabToggle isDisabled={props.isDisabled} isOpen={props.isOpen} onToggle={(value, event) => {
            event.preventDefault();
            event.stopPropagation();
            props.onToggle(value);
        }} />
    }

    const actionsFor = (registry: any): IAction[] => {
        return [
            { title: "Connect", onClick: () => onInstanceSelected(registry) },
            { isSeparator: true, },
            {
                title: "Delete", onClick: (event) => {
                    onDeleteInstanceClick(registry)
                    event.stopPropagation()
                }
            },
        ];
    }

    const sortParams = (column: any): ThProps["sort"] | undefined => {
        return column.sortable ? {
            sortBy: {
                index: 0,
                direction: "asc"
            },
            columnIndex: column.index
        } : undefined;
    };

    const loadingState: React.ReactNode = (
        <EmptyState>
            <EmptyStateIcon variant="container" component={Spinner} />
            <Title size="lg" headingLevel="h4">
                Loading instances
            </Title>
        </EmptyState>
    );

    const emptyState: React.ReactNode = (
        <EmptyState>
            <EmptyStateIcon icon={AddCircleOIcon} />
            <Title headingLevel="h4" size="lg">
                No instances
            </Title>
            <EmptyStateBody>
                To get started, create a new registry instance.
            </EmptyStateBody>
            <Button variant="primary" onClick={onCreateInstanceClick}>Create registry instance</Button>
        </EmptyState>
    );

    const reloadPage = () => {
        window.location.reload()
    }

    const errorState: React.ReactNode = (
        <EmptyState variant={EmptyStateVariant.large}>
            <EmptyStateIcon icon={ExclamationTriangleIcon} />
            <Title headingLevel="h4" size="lg">
                Error while fetching the list of instances.
            </Title>
            <EmptyStateBody>
                To resolve the issue, please try reloading the page.
            </EmptyStateBody>
            <Button variant="primary" onClick={reloadPage}>Reload page</Button>
        </EmptyState>
    )

    const toolbar: React.ReactNode = (
        <ToolbarGroup>
            <ToolbarItem>
                <Button style={{ marginBottom: "15px" }} variant="primary" onClick={onCreateInstanceClick}>Create registry instance</Button>
            </ToolbarItem>
        </ToolbarGroup>
    );

    return (
        <div className="instances">
            <ListWithToolbar toolbar={toolbar}
                emptyState={emptyState}
                isLoading={isLoadingInstances}
                loadingComponent={loadingState}
                isFiltered={false}
                isError={!instances}
                errorComponent={errorState}
                isEmpty={!instances || instances.length === 0}>
                <ResponsiveTable
                    ariaLabel="list of designs"
                    columns={columns}
                    data={instances}
                    expectedLength={instances?.length}
                    minimumColumnWidth={350}
                    onRowClick={(row) => onInstanceSelected(row.row.id === selectedInstance?.id ? undefined : row.row)}
                    renderHeader={({ column, Th, key }) => (
                        <Th sort={sortParams(column)}
                            className="design-list-header"
                            key={`header-${column.id}`}
                            width={column.width}
                            modifier="truncate">{column.label}</Th>
                    )}
                    renderCell={({ column, row, colIndex, Td, key }) => (
                        <Td className="design-list-cell" key={`cell-${colIndex}-${row.id}`} children={renderColumnData(row as Registry, colIndex)} />
                    )}
                    renderActions={({ row, ActionsColumn }) => (
                        <ActionsColumn key={`actions-${row['id']}`}
                            actionsToggle={renderActionsToggle}
                            items={actionsFor(row)} />
                    )}
                    isRowSelected={({ row }) => row.id === selectedInstance?.id}
                />
            </ListWithToolbar>
        </div>
    );
};
