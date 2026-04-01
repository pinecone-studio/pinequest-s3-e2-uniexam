import MyCourses from "./_components/MyCourses";

const CourseSelectionPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-14 mt-8 pb-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Хичээл сонголт
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Хэрэгтэй хичээлүүдээ эндээс нэмнэ.
          </p>
        </header>

        <MyCourses />
      </div>
    </div>
  );
};

export default CourseSelectionPage;
