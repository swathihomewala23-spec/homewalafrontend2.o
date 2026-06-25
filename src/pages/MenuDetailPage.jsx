import Seo from "../components/common/Seo";
import SiteLayout from "../components/common/SiteLayout";

const MenuDetailPage = ({ eyebrow, title, description, highlights = [] }) => {
  return (
    <>
      <Seo />
      <SiteLayout
        eyebrow={eyebrow}
        title={title}
        description={description}
        highlights={highlights}
      />
    </>
  );
};

export default MenuDetailPage;

