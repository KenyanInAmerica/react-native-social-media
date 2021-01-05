import ApolloClient from 'apollo-boost';
import base64 from 'react-native-base64';

export const client = new ApolloClient({
    uri: 'http://localhost:4000',
    request: operation => {
        operation.setContext({
            headers: {
                Authorization: base64.encode('@jane_doe:password')
            },
        });
    },
});