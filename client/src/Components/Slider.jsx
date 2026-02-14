import Ad1 from "../assets/ad (1).png";  
import Ad2 from "../assets/ad (2).png";
import Ad3 from "../assets/ad (3).png";


const ads = [Ad1, Ad2, Ad3];

function Slider() {
  const repeatedAds = [...ads, ...ads, ...ads, ...ads];

  return (
    <div className="slider" id="slider" >
      <div className="slide-track">
        {repeatedAds.map((ad, index) => (
          <div className="slide" key={index}>
             <img className="ad cursor-pointer" src={ad} alt={`ad-${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Slider;



