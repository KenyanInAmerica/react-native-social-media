import React from 'react';
import { Alert, FlatList, View } from 'react-native';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { requestFeed } from '../graphql/queries';
import { likeStatus, createStatus } from '../graphql/mutations';

import { Status, Separator } from '../components/Status';

const Feed = ({ navigation }) => {
  const { data, loading } = useQuery(requestFeed);
  const [likeStatusFn] = useMutation(likeStatus);

  const refetchQueries = [];

  refetchQueries.push({
    query: requestFeed,
  });

  const [createStatusFn] = useMutation(createStatus, {
    refetchQueries,
  });

  if (loading) {
    return null;
  }

  if (data.feed === null) {
    Alert.alert(
      "ERROR!",
      "Unauthorized: Please check authentication configuration",
      [
        {
          text: "Ok",
          onPress: () => console.log("Reload App")
        }
      ],
      { cancelable: false }
    )
  }

  return (
    <FlatList
      data={data.feed}
      renderItem={({ item }) => (
        <Status
          {...item}
          onRowPress={() => navigation.push('Thread', { status: item })}
          onHeartPress={() => likeStatusFn({ variables: { statusId: item._id } })}
          onRepostPress={() =>
            createStatusFn({
              variables: { statusText: `${item.user.username} posted "${item.status}"` },
            }).then(() => console.log(item))
          }
        />
      )}
      ItemSeparatorComponent={() => <Separator />}
      keyExtractor={item => item._id}
      ListFooterComponent={<View style={{ flex: 1, marginBottom: 60 }} />}
    />
  );
};

export default Feed;
