import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://codeifyitservices_db_user:codeify1234@cluster0.lorfcjp.mongodb.net/next-ecommerce?appName=Cluster0";

const lookbookSchema = new mongoose.Schema({}, { strict: false, collection: "lookbooks" });
const Lookbook = mongoose.model("Lookbook", lookbookSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const lbs = await Lookbook.find({});
    console.log(`Found ${lbs.length} lookbooks:`);
    lbs.forEach(lb => {
      console.log({
        id: lb._id,
        slug: lb.get("slug"),
        title: lb.get("title"),
        sliderImagesLength: lb.get("sliderImages")?.length,
        leftSliderImagesLength: lb.get("leftSliderImages")?.length,
        rightSliderImagesLength: lb.get("rightSliderImages")?.length,
      });
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
