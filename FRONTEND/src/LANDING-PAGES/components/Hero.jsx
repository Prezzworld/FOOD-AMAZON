import React from 'react';
import { HeroImg} from '../pages/Images';

const Hero = () => {
  return (
		<>
			<div id="hero" className="position-relative">
				<div className="container">
					<div className="row align-items-center mt-5 mt-lg-0">
						<div className="col-12 text-center col-lg-6 text-lg-start">
							<p className="p-hero font-inter fs-md lh-base">
								Discover the Pure Taste of Nature
							</p>
							<h1 className="font-nichrome fs-xxl text-primary-normal lh-1">
								Organic <span className="text-secondary-normal">Snacks </span>
								<br className='d-none d-lg-block' />
								Made <br className='d-none d-sm-block d-lg-none'/> <span className="text-secondary-normal">
									with
								</span> Love, <br className='d-none d-lg-block' />
								Just
								<span className="text-secondary-normal"> for</span> You!
							</h1>
							<div className="hero-button">
								<button className="bg-secondary-normal text-white fs-6 fw-semibold border-0 py-2 px-3 rounded-2">
									Shop Now
									<ion-icon
										name="storefront-outline"
										style={{
											fontSize: "18px",
											marginBottom: "-3px",
											marginLeft: "4px",
										}}
									></ion-icon>
								</button>
							</div>
						</div>
						<div className="col-12 col-lg-6">
							<div className="image">
								<img src={HeroImg} alt=""/>
							</div>
						</div>
					</div>
				</div>
				<div className="vector-1 position-absolute"></div>
        		<div className="vector-2 position-absolute"></div>

		  {/* For next section */}
        <div className="rectangle position-absolute w-100 bg-white opacity-75"></div>
			</div>
		</>
	);
}

export default Hero
