import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Numbers from "../components/Number";
import About from "../components/About";
import ProductShowcase from "../components/ProductShowcase";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { OfferSale } from "./Images";

const Home = () => {
	return (
		<>
			{/* <div className="body">
			<div className="container mx-auto"> */}
				<Header />
				<Hero />
				<Numbers />
				<ProductShowcase
					sectionType="popular"
					layoutStyle="scroll"
					limit={8}
					buttonLink="http://localhost:3004/api/food-amazon-database/products?popular=true"
				/>
				<About />
				<ProductShowcase
					sectionType="bulk"
					// layoutStyle="default"
					variant="bulk"
					limit={3}
					buttonText="See All Bulk Options"
					buttonLink="http://localhost:3004/api/food-amazon-database/products?bulkOrderEligible=true"
				/>
				<ProductShowcase
					sectionType="newest"
					layoutStyle="scroll"
					limit={8}
					buttonLink="http://localhost:3004/api/food-amazon-database/products?newest=true"
				/>
				<ProductShowcase
					sectionType="hasOffer"
					layoutStyle="grid"
					limit={4}
					imageSlot={
						<img
							src={OfferSale}
							alt="Special Offers"
							className="img-fluid w-100"
						/>
					}
					buttonLink="http://localhost:3004/api/food-amazon-database/products?hasOffer=true"
				/>
				<Newsletter />
				<Footer iconsDisplay />
			{/* </div> */}
			{/* // </div> */}
		</>
	);
};

export default Home;
