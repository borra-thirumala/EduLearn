import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  useGetCourseDetailWithStatusQuery,
  useVerifyPaymentMutation 
} from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const { data, isLoading, isError, refetch } =
    useGetCourseDetailWithStatusQuery(courseId);
  
  const [verifyPayment] = useVerifyPaymentMutation();

  // Handle payment success with immediate verification
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      const handlePaymentSuccess = async () => {
        setIsCheckingPayment(true);
        toast.info('Verifying your payment...');
        
        try {
          // Verify payment immediately instead of polling
          const result = await verifyPayment(sessionId).unwrap();
          
          if (result.purchased) {
            // Refetch to update UI
            await refetch();
            
            toast.success('Payment successful! Redirecting to your course...');
            
            // Clean up URL and redirect
            setTimeout(() => {
              navigate(`/course-progress/${courseId}`, { replace: true });
            }, 1500);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setIsCheckingPayment(false);
          toast.error('Error verifying payment. Please refresh the page or check "My Learning".');
          // Clean up URL
          window.history.replaceState({}, '', `/course-detail/${courseId}`);
        }
      };
      
      handlePaymentSuccess();
    } else if (canceled === 'true') {
      toast.error('Payment canceled. You can try again anytime.');
      // Clean up URL
      window.history.replaceState({}, '', `/course-detail/${courseId}`);
    }
  }, [searchParams, courseId, navigate, verifyPayment, refetch]);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Failed to load course details</h1>;
  if (!data || !data.course) return <h1>Failed to load course details</h1>;
  
  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle}
          </h1>
          <p className="text-base md:text-lg">
            {course?.subTitle || "Learn and master this course"}
          </p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator.name}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt.split("T")[0]}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents.length}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>{course.lectures.length} lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span>
                    {purchased ? <PlayCircle size={14} /> : <Lock size={14} />}
                  </span>
                  <p>{lecture.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                <ReactPlayer
                  width="100%"
                  height={"100%"}
                  url={course.lectures[0].videoUrl}
                  controls={true}
                />
              </div>
              <h1 className="font-medium">
                {course.lectures[0]?.lectureTitle || "Lecture title"}
              </h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">
                ₹{course?.coursePrice || "Price not available"}
              </h1>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {isCheckingPayment ? (
                <Button disabled className="w-full">
                  Verifying payment...
                </Button>
              ) : purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
