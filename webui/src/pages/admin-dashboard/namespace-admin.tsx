import React, { FunctionComponent, useState, useContext } from 'react';
import { Typography, Box, Button } from '@material-ui/core';

import { NamespaceDetail } from '../user/user-settings-namespace-detail';
import { DelayedLoadIndicator } from '../../components/delayed-load-indicator';
import { Namespace, isError } from '../../extension-registry-types';
import { PageSettingsContext, ServiceContext } from '../../default/default-app';
import { UserContext, ErrorHandlerContext } from '../../main';
import { NamespaceInput } from './namespace-input';
import { SearchListContainer } from './search-list-container';
import { handleError } from '../../utils';

export const NamespaceAdmin: FunctionComponent = props => {
    const errorContext = useContext(ErrorHandlerContext);

    const [loading, setLoading] = useState(false);
    const setLoadingState = (loadingState: boolean) => {
        setLoading(loadingState);
    };

    const pageSettings = useContext(PageSettingsContext);
    const service = useContext(ServiceContext);
    const user = useContext(UserContext);

    const [currentNamespace, setCurrentNamespace] = useState<Namespace | undefined>();
    const [notFound, setNotFound] = useState('');
    const fetchNamespace = async (namespaceName: string) => {
        try {
            if (namespaceName !== '') {
                setLoading(true);
                const namespace = await service.findNamespace(namespaceName);
                if (isError(namespace)) {
                    setNotFound(namespaceName);
                    setCurrentNamespace(undefined);
                } else {
                    setNotFound('');
                    setCurrentNamespace(namespace);
                }
                setLoading(false);
            } else {
                setNotFound('');
                setCurrentNamespace(undefined);
            }
        } catch (err) {
            errorContext ? errorContext.handleError(err) : handleError(err);
        }
    };

    const [inputValue, setInputValue] = useState('');
    const onChangeInput = (name: string) => {
        setInputValue(name);
    };

    const onCreate = async () => {
        await service.createNamespace({
            name: inputValue
        });
        await fetchNamespace(inputValue);
    };

    return (<>
        <DelayedLoadIndicator loading={loading} />
        <SearchListContainer
            searchContainer={
                [<NamespaceInput key='nsi' onSubmit={fetchNamespace} onChange={onChangeInput} />]
            }
            listContainer={
                currentNamespace && pageSettings && user ?
                    <NamespaceDetail
                        setLoadingState={setLoadingState}
                        handleError={errorContext ? errorContext.handleError : handleError}
                        namespace={currentNamespace}
                        pageSettings={pageSettings}
                        service={service}
                        user={user}
                    />
                    : notFound ?
                        <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                            <Typography variant='body1'>
                                Namespace {notFound} not found. Do you want to create it?
                            </Typography>
                            <Button variant='contained' color='primary' onClick={onCreate}>Create Namespace {notFound}</Button>
                        </Box>
                        : ''
            }
        />
    </>);
};