import mongoose from "mongoose";

const PreferenceSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "authId",
            required: true

        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },


        preferredStream: {
            type: String,
            required: true,
            enum: ['Engineering', 'Management', 'Arts', 'Science', 'Law', 'Medical', 'Design', 'Humanities']
        },
        interests: {
            type: String,
            enum: [
                'Focusing on Academics',
                'Focuses on Practical Learning',
                'Focuses on Theoretical Learning',
                'Empowering in Sports',
                'Empowering in Arts',
                'Special Focus on Mathematics',
                'Special Focus on Science',
                'Special Focus on Physical Education',
                'Leadership Development',
                'STEM Activities',
                'Cultural Education',
                'Technology Integration',
                'Environmental Awareness',
                  'Startup Incubation',
                      'Robotics Club'
            ],
        },
        collegeType: {
            type: String,
            required: true,
            enum: ['convent', 'private', 'government']
        },
        shifts: { type: [String], required: true, enum: ['morning', 'afternoon', 'night college', 'online'] },

    },
    {
        timestamps: true
    }
);

const Preference = mongoose.model("preferences", PreferenceSchema);
export default Preference;