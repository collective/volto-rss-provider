import { Container, Grid, Card, Image } from 'semantic-ui-react';
import Moment from 'moment';
import { UniversalLink, Icon } from '@plone/volto/components';
import ArrowRightSVG from '@plone/volto/icons/ahead.svg';

const ListingGridVariation = (props) => {
  const { items } = props;

  return (
    <div className="listing-grid">
      <Container>
        <Grid stackable columns={3}>
          <Grid.Row>
            {items.map((item) => (
              <Grid.Column>
                <Card className="news-card">
                  {item.image_scales && (
                    <Image
                      src={`${item['@id']}/${item.image_scales.image[0].scales.preview.download}`}
                    />
                  )}
                  <Card.Content>
                    <div className="news-card-subtitle">News</div>
                    <h3>
                      <UniversalLink href={item['@id']}>
                        {item.title}
                      </UniversalLink>
                    </h3>
                    <p className="date">
                      {Moment(item.Date).format('DD/MM/YYYY')}
                    </p>
                    <UniversalLink
                      className="news-card-button"
                      href={item['@id']}
                    >
                      <span>Read more</span>
                      <Icon name={ArrowRightSVG} size={16} />
                    </UniversalLink>
                  </Card.Content>
                </Card>
              </Grid.Column>
            ))}
          </Grid.Row>
        </Grid>
      </Container>
    </div>
  );
};

export default ListingGridVariation;
