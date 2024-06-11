import React from 'react';
import { Form, Field } from '@plone/volto/components';
import { TextareaWidget, TextWidget } from '@plone/volto/components';

const RSSFeedEdit = (props) => {
  // const { data, block, onChangeBlock } = props;

  // const onChangeField = (id, value) => {
  //   onChangeBlock(block, { ...data, [id]: value });
  // };

  // return (
  //   <div className="rss-feed-edit">
  //     <Form>
  //       <Field
  //         id="title"
  //         title="Title"
  //         value={data.title || ''}
  //         onChange={(value) => onChangeField('title', value)}
  //         widget={TextWidget}
  //       />
  //       <Field
  //         id="description"
  //         title="Description"
  //         value={data.description?.data || ''}
  //         onChange={(value) =>
  //           onChangeField('description', { ...data.description, data: value })
  //         }
  //         widget={TextareaWidget}
  //       />
  //       <Field
  //         id="rss_url"
  //         title="RSS Feed URL"
  //         value={data.rss_url || ''}
  //         onChange={(value) => onChangeField('rss_url', value)}
  //         widget={TextWidget}
  //       />
  //     </Form>
  // </div>
  // );
  return <div> Edit </div>;
};

export default RSSFeedEdit;
