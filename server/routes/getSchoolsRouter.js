import {
  PrimarySchools,
  AllSchools,
  Schools,
} from "../models/schoolsSchema.js";

import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { lgaOfEnrollment, schoolType } = req.query;
    let basket = {};

    if (lgaOfEnrollment) basket.LGA = lgaOfEnrollment;

    // Ensure schoolType is handled properly
    if (schoolType) {
      if (schoolType === "Technical") {
        schoolType = ["Technical", "Science & Vocational"];
        basket.schoolCategory = {
          $in: Array.isArray(schoolType) ? schoolType : [schoolType],
        };
      }
      if (schoolType === "UBE/JSS") {
        schoolType = ["UBE/JSS", "Public JSS"];
        basket.schoolCategory = {
          $in: Array.isArray(schoolType) ? schoolType : [schoolType],
        };
      }
      if (schoolType === "JSS/SSS") {
        schoolType = ["JSS/SSS", "Public JSS/SSS"];
        basket.schoolCategory = {
          $in: Array.isArray(schoolType) ? schoolType : [schoolType],
        };
      }
      if (schoolType === "Primary") {
        schoolType = ["ECCDE", "ECCDE AND PRIMARY", "PRIMARY", "Primary"];
        basket.schoolCategory = {
          $in: Array.isArray(schoolType) ? schoolType : [schoolType],
        };
      }
    }

    if(!schoolType && !lgaOfEnrollment) {
      basket = {};}


    const allSchools = await AllSchools.find(basket)
    // const allSchools = await AllSchools.aggregate([
    //   {
    //     $group: {
    //       "_id": "$LGA"
    //     }
    //   }
    // ])
    //   .sort("schoolName")
    //   .collation({ locale: "en", strength: 2 });


    res.status(200).json({ allSchools });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).json({ error: "Error processing data" });
  }
});

export default router;
