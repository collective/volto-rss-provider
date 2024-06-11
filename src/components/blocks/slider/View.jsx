import ImageGallery from 'react-image-gallery';
import Slide1Image from './slide1.png';
import Slide2Image from './slide2.png';
import Slide3Image from './slide3.png';

const View = (props) => {
  const slides = [
    {
      original: Slide1Image,
    },
    {
      original: Slide2Image,
    },
    {
      original: Slide3Image,
    },
  ];
  // we can't remove the nav arrows therefore we will use a workaround with empty markup
  const invisibleNav = () => {
    return <> </>;
  };

  return (
    <div className="block slider full-width">
      <ImageGallery
        items={slides}
        showFullscreenButton={false}
        showPlayButton={false}
        showBullets
        renderLeftNav={invisibleNav}
        renderRightNav={invisibleNav}
      />
    </div>
  );
};

export default View;
